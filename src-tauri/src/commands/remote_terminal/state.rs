//! Runtime state for the remote-terminal server: lifecycle, the active access
//! token, connected clients, and pending approval gates. A cloneable handle
//! over a shared `Arc<Mutex<..>>` so commands, the server task, and per-socket
//! bridges all observe the same state.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use tokio::sync::{broadcast, oneshot, watch};

use super::auth::{constant_time_eq, generate_token};
use super::types::{ClientInfo, RemotePermissions, RemoteStatus, RemoteTabInfo};

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
    /// Latching close signal for this client's bridge tasks. `send(true)` tells
    /// both the input and output loops to stop and close the socket.
    close: watch::Sender<bool>,
}

#[derive(Default)]
struct RemoteState {
    running: bool,
    ip: Option<String>,
    port: u16,
    token: String,
    shutdown_tx: Option<oneshot::Sender<()>>,
    clients: HashMap<String, ClientEntry>,
    pending: HashMap<String, oneshot::Sender<bool>>,
    /// Pending remote "new tab" requests: request id -> the channel the waiting
    /// WebSocket `New` handler blocks on. Resolved with the freshly-created
    /// session id once the desktop Terminal app has run its real `createTab`, so
    /// the requesting client can be attached to a genuine, locally-visible tab
    /// (instead of a private dedicated shell). An empty string signals failure.
    pending_new: HashMap<String, oneshot::Sender<String>>,
    /// Tabs the desktop Terminal app advertises to remote clients (ordered,
    /// with titles). Replaced wholesale by `set_tabs`; retained across server
    /// stop/start so a reconnecting client sees the current tabs immediately.
    tabs: Vec<RemoteTabInfo>,
    /// What approved remote devices are allowed to do with tabs. Replaced by
    /// `set_permissions`; retained across stop/start like `tabs`.
    permissions: RemotePermissions,
    /// Active per-device trust grants: random grant token -> expiry (epoch ms).
    /// A browser holding a live grant skips the approval prompt on reconnect
    /// (page reload). Issued on approval, slid forward on each reuse, and wiped
    /// when the server stops. In-memory only — a restart rotates the access
    /// token anyway, so cross-restart persistence would buy nothing.
    grants: HashMap<String, i64>,
}

#[derive(Clone)]
pub struct RemoteTerminalManager {
    inner: Arc<Mutex<RemoteState>>,
    /// Fires whenever the advertised tab list changes so connected WS bridges
    /// re-send it to their clients (live tab strip refresh).
    tabs_changed: broadcast::Sender<()>,
    /// Fires whenever the device permissions change so connected WS bridges
    /// re-send them to their clients (live new-tab / close control refresh).
    perms_changed: broadcast::Sender<()>,
}

impl Default for RemoteTerminalManager {
    fn default() -> Self {
        Self {
            inner: Arc::new(Mutex::new(RemoteState::default())),
            tabs_changed: broadcast::channel(16).0,
            perms_changed: broadcast::channel(16).0,
        }
    }
}

impl RemoteTerminalManager {
    pub fn new() -> Self {
        Self::default()
    }

    /// Replace the tab list the desktop Terminal app advertises to remote
    /// clients (ordered, with titles) and notify connected bridges to re-send
    /// it. Called by `cmd_remote_terminal_set_tabs` on every app tab change.
    pub fn set_tabs(&self, tabs: Vec<RemoteTabInfo>) {
        if let Ok(mut s) = self.inner.lock() {
            s.tabs = tabs;
        }
        let _ = self.tabs_changed.send(());
    }

    /// Snapshot the advertised tab list (ordered).
    pub fn tabs(&self) -> Vec<RemoteTabInfo> {
        self.inner.lock().map(|s| s.tabs.clone()).unwrap_or_default()
    }

    /// Subscribe to "advertised tab list changed" notifications.
    pub fn subscribe_tabs_changed(&self) -> broadcast::Receiver<()> {
        self.tabs_changed.subscribe()
    }

    /// Replace the device permissions advertised to (and enforced for) remote
    /// clients and notify connected bridges to re-send them.
    pub fn set_permissions(&self, permissions: RemotePermissions) {
        if let Ok(mut s) = self.inner.lock() {
            s.permissions = permissions;
        }
        let _ = self.perms_changed.send(());
    }

    /// Snapshot the current device permissions.
    pub fn permissions(&self) -> RemotePermissions {
        self.inner
            .lock()
            .map(|s| s.permissions)
            .unwrap_or_default()
    }

    /// Subscribe to "device permissions changed" notifications.
    pub fn subscribe_perms_changed(&self) -> broadcast::Receiver<()> {
        self.perms_changed.subscribe()
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
    pub fn status(&self) -> RemoteStatus {
        match self.inner.lock() {
            Ok(s) => {
                let url = match (&s.ip, s.running) {
                    (Some(ip), true) => Some(format!("http://{}:{}/?token={}", ip, s.port, s.token)),
                    _ => None,
                };
                RemoteStatus {
                    running: s.running,
                    url,
                    ip: s.ip.clone(),
                    port: if s.running { Some(s.port) } else { None },
                    token: if s.running { Some(s.token.clone()) } else { None },
                    clients: s.clients.values().map(|c| c.info.clone()).collect(),
                    permissions: s.permissions,
                }
            }
            Err(_) => RemoteStatus {
                running: false,
                url: None,
                ip: None,
                port: None,
                token: None,
                clients: Vec::new(),
                permissions: RemotePermissions::default(),
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

    /// Register a pending remote "new tab" request; returns the receiver the
    /// `New` handler awaits for the freshly-created session id.
    pub fn register_pending_new(&self, request_id: &str) -> oneshot::Receiver<String> {
        let (tx, rx) = oneshot::channel();
        if let Ok(mut s) = self.inner.lock() {
            s.pending_new.insert(request_id.to_string(), tx);
        }
        rx
    }

    /// Resolve a pending "new tab" request with the created session id (empty
    /// string = creation failed). Returns whether the request was still waiting.
    pub fn resolve_pending_new(&self, request_id: &str, session_id: String) -> bool {
        if let Ok(mut s) = self.inner.lock() {
            if let Some(tx) = s.pending_new.remove(request_id) {
                let _ = tx.send(session_id);
                return true;
            }
        }
        false
    }

    /// Drop a pending "new tab" request without resolving (e.g. timed out).
    pub fn remove_pending_new(&self, request_id: &str) {
        if let Ok(mut s) = self.inner.lock() {
            s.pending_new.remove(request_id);
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

    pub fn register_client(&self, info: ClientInfo, close: watch::Sender<bool>) {
        if let Ok(mut s) = self.inner.lock() {
            s.clients
                .insert(info.client_id.clone(), ClientEntry { info, close });
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

    pub fn snapshot_clients(&self) -> Vec<ClientInfo> {
        match self.inner.lock() {
            Ok(s) => s.clients.values().map(|c| c.info.clone()).collect(),
            Err(_) => Vec::new(),
        }
    }
}
