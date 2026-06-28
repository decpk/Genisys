//! Runtime state for the Content Share service: lifecycle, the persisted device
//! identity, discovered LAN peers, in-flight approval gates, and one-time upload
//! tokens. A cloneable handle over a shared `Arc<Mutex<..>>` so commands, the
//! server task, and route handlers all observe the same state.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use mdns_sd::ServiceDaemon;
use tokio::sync::{broadcast, oneshot};

use super::auth::constant_time_eq;
use super::identity::{load_or_create_identity, save_identity};
use super::types::{ContentShareStatus, SharePeer};

/// An offer the receiver has approved: the next `/share/upload` presenting the
/// matching one-time token is allowed in. Carries the sender name so the import
/// can label its "received" notification.
#[derive(Clone)]
pub struct ArmedUpload {
    pub token: String,
    pub sender_device_name: String,
}

#[derive(Default)]
struct ContentShareState {
    running: bool,
    ip: Option<String>,
    port: u16,
    shutdown_tx: Option<broadcast::Sender<()>>,
    /// Discovered peers, keyed by device id.
    peers: HashMap<String, SharePeer>,
    /// mDNS fullname -> device id, so a `ServiceRemoved` can drop the right peer.
    mdns_names: HashMap<String, String>,
    /// In-flight inbound offers awaiting the user's decision, keyed by transfer id.
    pending: HashMap<String, oneshot::Sender<bool>>,
    /// Approved offers awaiting their upload, keyed by transfer id.
    armed: HashMap<String, ArmedUpload>,
    /// Keeps the mDNS service registered + the browse task alive; dropping it
    /// unregisters us and stops discovery.
    mdns: Option<ServiceDaemon>,
}

#[derive(Clone)]
pub struct ContentShareManager {
    inner: Arc<Mutex<ContentShareState>>,
    device_id: Arc<String>,
    device_name: Arc<Mutex<String>>,
}

impl Default for ContentShareManager {
    fn default() -> Self {
        let (id, name) = load_or_create_identity();
        Self {
            inner: Arc::new(Mutex::new(ContentShareState::default())),
            device_id: Arc::new(id),
            device_name: Arc::new(Mutex::new(name)),
        }
    }
}

impl ContentShareManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn device_id(&self) -> String {
        (*self.device_id).clone()
    }

    pub fn device_name(&self) -> String {
        self.device_name.lock().map(|n| n.clone()).unwrap_or_default()
    }

    /// Rename this device (persisted). Takes effect on the next advertise.
    pub fn set_device_name(&self, name: &str) {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            return;
        }
        if let Ok(mut n) = self.device_name.lock() {
            *n = trimmed.to_string();
        }
        save_identity(&self.device_id, trimmed);
    }

    pub fn is_running(&self) -> bool {
        self.inner.lock().map(|s| s.running).unwrap_or(false)
    }

    /// Record that the server + mDNS started and take ownership of the shutdown
    /// trigger and the mDNS daemon handle.
    pub fn mark_started(&self, ip: String, port: u16, shutdown_tx: broadcast::Sender<()>, mdns: ServiceDaemon) {
        if let Ok(mut s) = self.inner.lock() {
            s.running = true;
            s.ip = Some(ip);
            s.port = port;
            s.shutdown_tx = Some(shutdown_tx);
            s.mdns = Some(mdns);
            s.peers.clear();
            s.mdns_names.clear();
        }
    }

    /// Drain state for shutdown: returns the graceful-shutdown sender. Denies any
    /// in-flight approvals, drops the mDNS daemon (unregistering us), and clears
    /// peers/armed uploads. Idempotent.
    pub fn take_for_stop(&self) -> Option<broadcast::Sender<()>> {
        let mut shutdown = None;
        if let Ok(mut s) = self.inner.lock() {
            shutdown = s.shutdown_tx.take();
            for (_, tx) in s.pending.drain() {
                let _ = tx.send(false);
            }
            s.armed.clear();
            s.peers.clear();
            s.mdns_names.clear();
            s.mdns = None;
            s.running = false;
            s.ip = None;
            s.port = 0;
        }
        shutdown
    }

    /// Snapshot the current status for the desktop UI.
    pub fn status(&self) -> ContentShareStatus {
        let device_id = self.device_id();
        let device_name = self.device_name();
        match self.inner.lock() {
            Ok(s) => ContentShareStatus {
                running: s.running,
                device_id,
                device_name,
                ip: s.ip.clone(),
                port: if s.running { Some(s.port) } else { None },
                peers: s.peers.values().cloned().collect(),
            },
            Err(_) => ContentShareStatus {
                running: false,
                device_id,
                device_name,
                ip: None,
                port: None,
                peers: Vec::new(),
            },
        }
    }

    pub fn list_peers(&self) -> Vec<SharePeer> {
        self.inner.lock().map(|s| s.peers.values().cloned().collect()).unwrap_or_default()
    }

    pub fn peer(&self, device_id: &str) -> Option<SharePeer> {
        self.inner.lock().ok().and_then(|s| s.peers.get(device_id).cloned())
    }

    /// Insert or update a discovered peer, remembering its mDNS fullname.
    pub fn upsert_peer(&self, fullname: &str, peer: SharePeer) {
        if let Ok(mut s) = self.inner.lock() {
            s.mdns_names.insert(fullname.to_string(), peer.device_id.clone());
            s.peers.insert(peer.device_id.clone(), peer);
        }
    }

    /// Drop a peer by its mDNS fullname; returns the removed device id.
    pub fn remove_peer_by_fullname(&self, fullname: &str) -> Option<String> {
        if let Ok(mut s) = self.inner.lock() {
            if let Some(device_id) = s.mdns_names.remove(fullname) {
                s.peers.remove(&device_id);
                return Some(device_id);
            }
        }
        None
    }

    /// Register a new pending approval; returns the receiver the offer handler
    /// awaits for the user's decision.
    pub fn register_pending(&self, transfer_id: &str) -> oneshot::Receiver<bool> {
        let (tx, rx) = oneshot::channel();
        if let Ok(mut s) = self.inner.lock() {
            s.pending.insert(transfer_id.to_string(), tx);
        }
        rx
    }

    /// Resolve a pending approval (accept/decline). Returns whether it existed.
    pub fn resolve_pending(&self, transfer_id: &str, accept: bool) -> bool {
        if let Ok(mut s) = self.inner.lock() {
            if let Some(tx) = s.pending.remove(transfer_id) {
                let _ = tx.send(accept);
                return true;
            }
        }
        false
    }

    /// Drop a pending approval without resolving (e.g. timed out).
    pub fn remove_pending(&self, transfer_id: &str) {
        if let Ok(mut s) = self.inner.lock() {
            s.pending.remove(transfer_id);
        }
    }

    /// Arm an approved transfer with a one-time upload token.
    pub fn arm_upload(&self, transfer_id: &str, armed: ArmedUpload) {
        if let Ok(mut s) = self.inner.lock() {
            s.armed.insert(transfer_id.to_string(), armed);
        }
    }

    /// Consume an armed upload whose one-time token matches (constant-time).
    /// Returns the armed entry, removing it so the token cannot be reused.
    pub fn take_armed(&self, token: &str) -> Option<ArmedUpload> {
        if !self.is_running() {
            return None;
        }
        if let Ok(mut s) = self.inner.lock() {
            let key = s
                .armed
                .iter()
                .find(|(_, a)| constant_time_eq(&a.token, token))
                .map(|(k, _)| k.clone());
            if let Some(k) = key {
                return s.armed.remove(&k);
            }
        }
        None
    }
}
