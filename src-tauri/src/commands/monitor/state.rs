//! Runtime state for the Monitor server: lifecycle, the active access token,
//! connected viewers, pending approval gates, and per-client signaling channels.
//! A cloneable handle over a shared `Arc<Mutex<..>>` so commands, the server
//! task, and per-socket bridges all observe the same state.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use serde_json::Value;
use tokio::sync::{mpsc, oneshot, watch};

use super::auth::{constant_time_eq, generate_token};
use super::types::{ClientInfo, MonitorStatus};

/// How long a remote device stays trusted after approval before it must be
/// re-approved. Refreshed on every successful (re)connect (sliding window) so an
/// actively-used device is never interrupted mid-session.
const GRANT_TTL_MS: i64 = 6 * 60 * 60 * 1000;

/// Current wall-clock time in epoch milliseconds.
fn now_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

/// Drop every trust grant whose expiry is in the past.
fn purge_expired_grants(grants: &mut HashMap<String, i64>) {
    let now = now_ms();
    grants.retain(|_, &mut expires_at| expires_at > now);
}

struct ClientEntry {
    info: ClientInfo,
    /// Latching close signal for this client's bridge task. `send(true)` tells
    /// the loop to stop and close the socket.
    close: watch::Sender<bool>,
    /// Push channel for WebRTC signaling the desktop wants delivered to *this*
    /// viewer (offer / ICE candidate). The WS bridge forwards each value as a
    /// `ServerMessage::Signal`. Unbounded + sync `send` so the Tauri command can
    /// route without awaiting.
    signal_tx: mpsc::UnboundedSender<Value>,
}

#[derive(Default)]
struct MonitorState {
    running: bool,
    ip: Option<String>,
    port: u16,
    token: String,
    shutdown_tx: Option<oneshot::Sender<()>>,
    clients: HashMap<String, ClientEntry>,
    pending: HashMap<String, oneshot::Sender<bool>>,
    /// Active per-device trust grants: random grant token -> expiry (epoch ms).
    /// A browser holding a live grant skips the approval prompt on reconnect
    /// (page reload). Issued on approval, slid forward on each reuse, and wiped
    /// when the server stops. In-memory only — a restart rotates the access
    /// token anyway, so cross-restart persistence would buy nothing.
    grants: HashMap<String, i64>,
}

#[derive(Clone)]
pub struct MonitorManager {
    inner: Arc<Mutex<MonitorState>>,
}

impl Default for MonitorManager {
    fn default() -> Self {
        Self {
            inner: Arc::new(Mutex::new(MonitorState::default())),
        }
    }
}

impl MonitorManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_running(&self) -> bool {
        self.inner.lock().map(|s| s.running).unwrap_or(false)
    }

    /// Record that the server has started and take ownership of its
    /// graceful-shutdown trigger.
    pub fn mark_started(
        &self,
        ip: String,
        port: u16,
        token: String,
        shutdown_tx: oneshot::Sender<()>,
    ) {
        if let Ok(mut s) = self.inner.lock() {
            s.running = true;
            s.ip = Some(ip);
            s.port = port;
            s.token = token;
            s.shutdown_tx = Some(shutdown_tx);
        }
    }

    /// Drain state for shutdown. Returns the server's graceful-shutdown sender
    /// plus every client's close signal so the caller can disconnect them, and
    /// denies any in-flight approval requests. Idempotent.
    pub fn take_for_stop(&self) -> (Option<oneshot::Sender<()>>, Vec<watch::Sender<bool>>) {
        let mut closes = Vec::new();
        let mut shutdown = None;
        if let Ok(mut s) = self.inner.lock() {
            shutdown = s.shutdown_tx.take();
            for (_, entry) in s.clients.drain() {
                closes.push(entry.close);
            }
            for (_, tx) in s.pending.drain() {
                let _ = tx.send(false);
            }
            // Turning sharing off revokes every device's trust.
            s.grants.clear();
            s.running = false;
            s.token.clear();
            s.ip = None;
            s.port = 0;
        }
        (shutdown, closes)
    }

    /// Validate a presented token against the live one (constant-time). Always
    /// false when the server is not running or no token is set.
    pub fn validate_token(&self, token: &str) -> bool {
        match self.inner.lock() {
            Ok(s) => s.running && !s.token.is_empty() && constant_time_eq(&s.token, token),
            Err(_) => false,
        }
    }

    /// Snapshot the current server status for the desktop UI.
    pub fn status(&self) -> MonitorStatus {
        match self.inner.lock() {
            Ok(s) => {
                let url = match (&s.ip, s.running) {
                    (Some(ip), true) => Some(format!("http://{}:{}/?token={}", ip, s.port, s.token)),
                    _ => None,
                };
                MonitorStatus {
                    running: s.running,
                    url,
                    ip: s.ip.clone(),
                    port: if s.running { Some(s.port) } else { None },
                    token: if s.running { Some(s.token.clone()) } else { None },
                    clients: s.clients.values().map(|c| c.info.clone()).collect(),
                }
            }
            Err(_) => MonitorStatus {
                running: false,
                url: None,
                ip: None,
                port: None,
                token: None,
                clients: Vec::new(),
            },
        }
    }

    /// Register a new pending approval; returns the receiver the bridge awaits.
    pub fn register_pending(&self, request_id: &str) -> oneshot::Receiver<bool> {
        let (tx, rx) = oneshot::channel();
        if let Ok(mut s) = self.inner.lock() {
            s.pending.insert(request_id.to_string(), tx);
        }
        rx
    }

    /// Resolve a pending approval (allow/deny). Returns whether it existed.
    pub fn resolve_pending(&self, request_id: &str, approved: bool) -> bool {
        if let Ok(mut s) = self.inner.lock() {
            if let Some(tx) = s.pending.remove(request_id) {
                let _ = tx.send(approved);
                return true;
            }
        }
        false
    }

    /// Drop a pending approval without resolving (e.g. the socket went away).
    pub fn remove_pending(&self, request_id: &str) {
        if let Ok(mut s) = self.inner.lock() {
            s.pending.remove(request_id);
        }
    }

    /// Issue a fresh trust grant for a just-approved device. Returns the random
    /// grant token (for the browser to store) and its expiry (epoch ms). Expired
    /// grants are purged opportunistically.
    pub fn issue_grant(&self) -> (String, i64) {
        let token = generate_token();
        let expires_at = now_ms() + GRANT_TTL_MS;
        if let Ok(mut s) = self.inner.lock() {
            purge_expired_grants(&mut s.grants);
            s.grants.insert(token.clone(), expires_at);
        }
        (token, expires_at)
    }

    /// Validate a grant presented on (re)connect. When it is known and unexpired
    /// the device is auto-approved: the grant's expiry is slid forward by the
    /// full TTL (sliding window) and the new expiry is returned so the browser
    /// can refresh its stored copy. Returns `None` for missing/expired grants.
    pub fn refresh_grant(&self, grant: &str) -> Option<i64> {
        if grant.is_empty() {
            return None;
        }
        let mut s = self.inner.lock().ok()?;
        purge_expired_grants(&mut s.grants);
        if !s.grants.contains_key(grant) {
            return None;
        }
        let new_expires_at = now_ms() + GRANT_TTL_MS;
        s.grants.insert(grant.to_string(), new_expires_at);
        Some(new_expires_at)
    }

    /// Register a connected viewer with its close signal and signaling channel.
    pub fn register_client(
        &self,
        info: ClientInfo,
        close: watch::Sender<bool>,
        signal_tx: mpsc::UnboundedSender<Value>,
    ) {
        if let Ok(mut s) = self.inner.lock() {
            s.clients.insert(
                info.client_id.clone(),
                ClientEntry {
                    info,
                    close,
                    signal_tx,
                },
            );
        }
    }

    pub fn unregister_client(&self, client_id: &str) {
        if let Ok(mut s) = self.inner.lock() {
            s.clients.remove(client_id);
        }
    }

    /// Clone of a client's close signal, used by the disconnect command to kick.
    pub fn client_close(&self, client_id: &str) -> Option<watch::Sender<bool>> {
        let s = self.inner.lock().ok()?;
        s.clients.get(client_id).map(|c| c.close.clone())
    }

    /// Route a WebRTC signaling payload from the desktop to one specific viewer.
    /// Returns whether a live client received it.
    pub fn send_to_client(&self, client_id: &str, data: Value) -> bool {
        if let Ok(s) = self.inner.lock() {
            if let Some(entry) = s.clients.get(client_id) {
                return entry.signal_tx.send(data).is_ok();
            }
        }
        false
    }

    pub fn snapshot_clients(&self) -> Vec<ClientInfo> {
        match self.inner.lock() {
            Ok(s) => s.clients.values().map(|c| c.info.clone()).collect(),
            Err(_) => Vec::new(),
        }
    }
}
