//! `MessagingManager` — stateful singleton registered via `.manage(...)`.
//!
//! Holds the local identity, active sessions, discovered peers, trust store
//! and the mDNS daemon. Orchestration lives here; pure reusable logic lives in
//! the `crypto`, `transport`, `discovery`, `identity` and `trust` submodules.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex as StdMutex};

use base64::{engine::general_purpose::STANDARD, Engine};
use mdns_sd::ServiceDaemon;
use tauri::{AppHandle, Emitter};
use tokio::net::TcpListener;
use tokio::sync::oneshot;
use tokio::task::JoinHandle;

use crate::messaging::crypto::fingerprint;
use crate::messaging::discovery::{advertise, browse};
use crate::messaging::identity::{
    load_offline_flag, load_or_create_identity, regenerate_identity, save_display_name,
    save_offline_flag,
};
use crate::messaging::network::detect_local_ip;
use crate::messaging::transport::accept_loop::accept_loop;
use crate::messaging::transport::perform_handshake_initiator::perform_handshake_initiator;
use crate::messaging::transport::run_session::run_session;
use crate::messaging::trust::{load_trust_store, save_trust_store};
use crate::messaging::types::*;

#[derive(Default)]
struct IdentityState {
    private_key: Vec<u8>,
    public_key: Vec<u8>,
    display_name: String,
    listen_port: u16,
    fingerprint: String,
    loaded: bool,
    offline: bool,
}

/// Shared inner state. Cloned (as `Arc`) into background tasks so they can emit
/// events and mutate shared maps. All mutexes are held only briefly and never
/// across an `.await`.
pub struct ManagerInner {
    identity: StdMutex<IdentityState>,
    sessions: StdMutex<HashMap<String, SessionHandle>>,
    discovered: StdMutex<HashMap<String, MsgPeer>>,
    trust_store: StdMutex<HashMap<String, TrustEntry>>,
    host_keys: StdMutex<HashMap<String, String>>,
    mdns_names: StdMutex<HashMap<String, String>>,
    /// Inbound chat requests awaiting the user's accept/reject decision,
    /// keyed by the requesting peer id. The oneshot delivers the decision to
    /// the parked responder session task.
    pending_requests: StdMutex<HashMap<String, oneshot::Sender<bool>>>,
    /// Handle to the running accept-loop task so it can be aborted on rotate.
    accept_handle: StdMutex<Option<JoinHandle<()>>>,
    started: AtomicBool,
    /// Invisible mode: when `true` we don't advertise/browse/accept. Mirrors
    /// `IdentityState.offline` and is persisted to presence.json.
    offline: AtomicBool,
    mdns: StdMutex<Option<ServiceDaemon>>,
}

/// Public manager handle stored in Tauri state.
pub struct MessagingManager {
    inner: Arc<ManagerInner>,
}

impl MessagingManager {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(ManagerInner {
                identity: StdMutex::new(IdentityState::default()),
                sessions: StdMutex::new(HashMap::new()),
                discovered: StdMutex::new(HashMap::new()),
                trust_store: StdMutex::new(load_trust_store()),
                host_keys: StdMutex::new(HashMap::new()),
                mdns_names: StdMutex::new(HashMap::new()),
                pending_requests: StdMutex::new(HashMap::new()),
                accept_handle: StdMutex::new(None),
                started: AtomicBool::new(false),
                offline: AtomicBool::new(false),
                mdns: StdMutex::new(None),
            }),
        }
    }

    /// Initialise identity, start the TCP listener + mDNS. Idempotent.
    pub async fn start(&self, app: AppHandle) -> Result<MsgIdentity, String> {
        self.inner.ensure_identity()?;
        if self.inner.started.load(Ordering::SeqCst) {
            return self.get_identity();
        }

        // Persisted invisible mode: come up with no network presence at all.
        // The user can flip back online via `set_offline(false)`.
        if self.inner.offline.load(Ordering::SeqCst) {
            self.inner.started.store(true, Ordering::SeqCst);
            return self.get_identity();
        }

        let listener = bind_listener().await?;
        let port = listener.local_addr().map_err(|e| e.to_string())?.port();
        self.inner.set_listen_port(port);

        let inner = self.inner.clone();
        let handle = tokio::spawn(accept_loop(app.clone(), inner.clone(), listener));
        self.inner.set_accept_handle(handle);

        let daemon = ServiceDaemon::new().map_err(|e| e.to_string())?;
        advertise(&daemon, &self.inner.instance_name(), port, &self.inner.our_pub_b64(), &self.inner.display_name())?;
        browse(&daemon, app, inner)?;
        if let Ok(mut slot) = self.inner.mdns.lock() {
            *slot = Some(daemon);
        }

        self.inner.started.store(true, Ordering::SeqCst);
        self.get_identity()
    }

    /// Rotate this device's identity: generate a brand-new keypair (so the
    /// fingerprint / unique id changes) and rebind the listener to a fresh
    /// port. Anyone holding the previous `host:port` can no longer connect,
    /// and the new fingerprint means peers must re-verify. Existing open
    /// sessions are intentionally left running.
    pub async fn rotate(&self, app: AppHandle) -> Result<MsgIdentity, String> {
        self.inner.ensure_identity()?;

        // 1. Tear down the previous presence BEFORE switching identity: stop
        //    the old listener, drop the old mDNS daemon (which unregisters the
        //    previous advertisement and stops the old browse task) and clear
        //    the discovered-peers list. Doing this while the identity is still
        //    the OLD key means any final event from the old browse still
        //    matches our self-skip, so our own advertisement is never recorded
        //    as a peer — and the refreshed list won't show stale duplicates.
        self.inner.abort_accept();
        if let Ok(mut slot) = self.inner.mdns.lock() {
            *slot = None;
        }
        self.inner.clear_discovery_state();

        // 2. New keypair, persisted (identity.key + identity.json), keep name.
        let (private_key, public_key) = regenerate_identity()?;
        let name = self.inner.display_name();
        save_display_name(&name, &STANDARD.encode(&public_key))?;
        self.inner.replace_identity(private_key, public_key);

        // 3. Bind a fresh ephemeral port and start a new accept loop.
        let listener = bind_fresh_listener().await?;
        let port = listener.local_addr().map_err(|e| e.to_string())?.port();
        self.inner.set_listen_port(port);
        let inner = self.inner.clone();
        let handle = tokio::spawn(accept_loop(app.clone(), inner.clone(), listener));
        self.inner.set_accept_handle(handle);

        // 4. Advertise + browse under the new identity. The list rebuilds from
        //    live responses, so the previous address's peers (and our own old
        //    advertisement) neither linger nor appear duplicated.
        let daemon = ServiceDaemon::new().map_err(|e| e.to_string())?;
        advertise(&daemon, &self.inner.instance_name(), port, &self.inner.our_pub_b64(), &name)?;
        browse(&daemon, app, inner)?;
        if let Ok(mut slot) = self.inner.mdns.lock() {
            *slot = Some(daemon);
        }

        self.get_identity()
    }

    /// Re-trigger LAN discovery without changing identity: recreate the mDNS
    /// daemon (dropping the old one unregisters the previous service and stops
    /// the old browse), re-advertise under the SAME identity + port, and start
    /// a fresh browse. Clears the discovered-peers map so the list rebuilds
    /// from live responses. No-op semantics when offline (nothing to do) or
    /// before `start()`.
    pub async fn rescan(&self, app: AppHandle) -> Result<MsgIdentity, String> {
        self.inner.ensure_identity()?;
        if !self.inner.started.load(Ordering::SeqCst) {
            return Err("Messaging hasn't started yet.".to_string());
        }
        if self.inner.offline.load(Ordering::SeqCst) {
            return Err("You're offline — go online to scan for peers.".to_string());
        }

        // Drop stale discovered peers so the refreshed browse rebuilds the list.
        if let Ok(mut d) = self.inner.discovered.lock() {
            d.clear();
        }

        let inner = self.inner.clone();
        let port = self.inner.listen_port_value();
        let daemon = ServiceDaemon::new().map_err(|e| e.to_string())?;
        advertise(&daemon, &self.inner.instance_name(), port, &self.inner.our_pub_b64(), &self.inner.display_name())?;
        browse(&daemon, app, inner)?;
        if let Ok(mut slot) = self.inner.mdns.lock() {
            *slot = Some(daemon);
        }

        self.get_identity()
    }

    pub fn get_identity(&self) -> Result<MsgIdentity, String> {
        self.inner.ensure_identity()?;
        Ok(self.inner.identity_snapshot())
    }

    pub fn set_display_name(&self, name: String) -> Result<MsgIdentity, String> {
        self.inner.ensure_identity()?;
        self.inner.set_display_name_internal(&name)?;
        Ok(self.inner.identity_snapshot())
    }

    /// Toggle invisible mode. When going offline we tear down all network
    /// presence (mDNS advertise + browse, inbound accept loop) and clear the
    /// discovered-peers map; existing open sessions are intentionally left
    /// running. When coming back online we re-bind the listener and
    /// re-advertise/browse, mirroring `start()`. The flag is persisted so the
    /// app relaunches in the same state.
    pub async fn set_offline(&self, app: AppHandle, offline: bool) -> Result<MsgIdentity, String> {
        self.inner.ensure_identity()?;

        // No-op if already in the requested state (but still persist to be safe).
        let already = self.inner.offline.load(Ordering::SeqCst);
        save_offline_flag(offline)?;
        self.inner.set_offline_flag(offline);
        if already == offline {
            return self.get_identity();
        }

        if offline {
            self.inner.go_offline();
        } else {
            let listener = bind_listener().await?;
            let port = listener.local_addr().map_err(|e| e.to_string())?.port();
            self.inner.set_listen_port(port);

            let inner = self.inner.clone();
            let handle = tokio::spawn(accept_loop(app.clone(), inner.clone(), listener));
            self.inner.set_accept_handle(handle);

            let daemon = ServiceDaemon::new().map_err(|e| e.to_string())?;
            advertise(&daemon, &self.inner.instance_name(), port, &self.inner.our_pub_b64(), &self.inner.display_name())?;
            browse(&daemon, app, inner)?;
            if let Ok(mut slot) = self.inner.mdns.lock() {
                *slot = Some(daemon);
            }
            self.inner.started.store(true, Ordering::SeqCst);
        }

        Ok(self.inner.identity_snapshot())
    }

    pub fn get_peers(&self) -> Vec<MsgPeer> {
        self.inner.peers_snapshot()
    }

    pub async fn connect(
        &self,
        app: AppHandle,
        peer_id: Option<String>,
        host: Option<String>,
        port: Option<u16>,
    ) -> Result<MsgPeer, String> {
        self.inner.ensure_identity()?;
        let (target_host, target_port) = self.inner.resolve_target(&peer_id, &host, port)?;

        if let Some(mut p) = peer_id.as_ref().and_then(|id| self.inner.discovered_clone(id)) {
            p.status = "connecting".to_string();
            let _ = app.emit("msg-peer-updated", &p);
        }

        let private_key = self.inner.private_key();
        let mut stream = tokio::net::TcpStream::connect((target_host.as_str(), target_port))
            .await
            .map_err(|e| e.to_string())?;
        let (transport, pubkey) = perform_handshake_initiator(&mut stream, &private_key).await?;

        let actual_id = hex::encode(&pubkey);
        if actual_id == hex::encode(self.inner.our_pub_bytes()) {
            return Err("That address is this device — you can't connect to yourself.".to_string());
        }
        let verified = self.inner.trust_verified(&actual_id);
        let key_changed = self.inner.check_host_key_changed(&target_host, &actual_id);

        // Build a provisional "connecting" peer to return immediately so the UI
        // can show a pending conversation while the remote side accepts. The
        // session driver runs in the background and emits status updates.
        let safety = crate::messaging::crypto::safety_number(&self.inner.our_pub_bytes(), &pubkey);
        let provisional = MsgPeer {
            id: actual_id.clone(),
            public_key: STANDARD.encode(&pubkey),
            display_name: actual_id.chars().take(8).collect(),
            host: target_host.clone(),
            port: target_port,
            status: "connecting".to_string(),
            verified,
            key_changed,
            safety_number: Some(safety),
        };

        let inner = self.inner.clone();
        let driver_app = app.clone();
        let driver_id = actual_id.clone();
        tokio::spawn(async move {
            if let Err(e) = run_session(
                driver_app.clone(), inner, SessionRole::Initiator, actual_id, pubkey,
                target_host, target_port, verified, key_changed, stream, transport,
            )
            .await
            {
                let _ = driver_app.emit(
                    "msg-error",
                    serde_json::json!({ "peerId": driver_id, "error": e }),
                );
            }
        });

        Ok(provisional)
    }

    /// Resolve an inbound chat request: `accept = true` lets the parked
    /// responder session proceed; `false` rejects and closes it.
    pub fn respond_request(&self, peer_id: String, accept: bool) -> Result<(), String> {
        match self.inner.take_request(&peer_id) {
            Some(tx) => {
                let _ = tx.send(accept);
                Ok(())
            }
            None => Err("no pending request for that peer".to_string()),
        }
    }

    pub fn disconnect(&self, app: AppHandle, peer_id: String) -> Result<(), String> {
        if let Some(handle) = self.inner.remove_session(&peer_id) {
            handle.reader.abort();
            let mut peer = handle.peer.clone();
            peer.status = "disconnected".to_string();
            let _ = app.emit("msg-peer-updated", &peer);
        }
        Ok(())
    }

    pub fn send_text(&self, peer_id: String, text: String) -> Result<MsgEnvelope, String> {
        let wire = WireMessage { kind: "text".into(), text: Some(text.clone()), image_base64: None, mime_type: None, file_name: None, is_typing: None, signal: None, control: None };
        self.inner.send_wire(&peer_id, wire)?;
        Ok(outgoing_envelope(&peer_id, "text", Some(text), None, None, None))
    }

    pub fn send_image(&self, peer_id: String, data_base64: String, mime_type: String, file_name: Option<String>) -> Result<MsgEnvelope, String> {
        let decoded = STANDARD.decode(&data_base64).map_err(|_| "invalid base64 image".to_string())?;
        if decoded.len() > MAX_IMAGE_SIZE {
            return Err("image exceeds 10 MB".to_string());
        }
        let wire = WireMessage { kind: "image".into(), text: None, image_base64: Some(data_base64.clone()), mime_type: Some(mime_type.clone()), file_name: file_name.clone(), is_typing: None, signal: None, control: None };
        self.inner.send_wire(&peer_id, wire)?;
        Ok(outgoing_envelope(&peer_id, "image", None, Some(data_base64), Some(mime_type), file_name))
    }

    pub fn verify_peer(&self, app: AppHandle, peer_id: String) -> Result<MsgPeer, String> {
        let peer = self.inner.mark_verified(&peer_id)?;
        let _ = app.emit("msg-peer-updated", &peer);
        Ok(peer)
    }

    pub fn set_typing(&self, peer_id: String, is_typing: bool) -> Result<(), String> {
        let wire = WireMessage { kind: "typing".into(), text: None, image_base64: None, mime_type: None, file_name: None, is_typing: Some(is_typing), signal: None, control: None };
        self.inner.send_wire(&peer_id, wire)
    }

    pub fn send_signal(&self, peer_id: String, payload: String) -> Result<(), String> {
        let wire = WireMessage { kind: "signal".into(), text: None, image_base64: None, mime_type: None, file_name: None, is_typing: None, signal: Some(payload), control: None };
        self.inner.send_wire(&peer_id, wire)
    }

    pub fn send_control(&self, peer_id: String, payload: String) -> Result<(), String> {
        let wire = WireMessage { kind: "control".into(), text: None, image_base64: None, mime_type: None, file_name: None, is_typing: None, signal: None, control: Some(payload) };
        self.inner.send_wire(&peer_id, wire)
    }
}

impl Default for MessagingManager {
    fn default() -> Self {
        Self::new()
    }
}

async fn bind_listener() -> Result<TcpListener, String> {
    match TcpListener::bind(("0.0.0.0", DEFAULT_PORT)).await {
        Ok(listener) => Ok(listener),
        Err(_) => TcpListener::bind(("0.0.0.0", 0)).await.map_err(|e| e.to_string()),
    }
}

/// Binds to a fresh ephemeral port (never the default) — used by `rotate` so
/// the new address is guaranteed to differ from the previous one.
async fn bind_fresh_listener() -> Result<TcpListener, String> {
    TcpListener::bind(("0.0.0.0", 0)).await.map_err(|e| e.to_string())
}

fn outgoing_envelope(
    peer_id: &str,
    kind: &str,
    text: Option<String>,
    image_base64: Option<String>,
    mime_type: Option<String>,
    file_name: Option<String>,
) -> MsgEnvelope {
    MsgEnvelope {
        id: uuid::Uuid::new_v4().to_string(),
        peer_id: peer_id.to_string(),
        direction: "outgoing".to_string(),
        kind: kind.to_string(),
        text,
        image_base64,
        mime_type,
        file_name,
        timestamp: chrono::Utc::now().timestamp_millis(),
    }
}

impl ManagerInner {
    fn ensure_identity(&self) -> Result<(), String> {
        let mut id = self.identity.lock().map_err(|_| "identity lock poisoned".to_string())?;
        if id.loaded {
            return Ok(());
        }
        let (private_key, public_key, display_name) = load_or_create_identity()?;
        id.fingerprint = fingerprint(&public_key);
        id.private_key = private_key;
        id.public_key = public_key;
        id.display_name = display_name;
        id.offline = load_offline_flag();
        id.loaded = true;
        self.offline.store(id.offline, Ordering::SeqCst);
        Ok(())
    }

    fn identity_snapshot(&self) -> MsgIdentity {
        match self.identity.lock() {
            Ok(g) => MsgIdentity {
                public_key: STANDARD.encode(&g.public_key),
                fingerprint: g.fingerprint.clone(),
                display_name: g.display_name.clone(),
                listen_port: g.listen_port,
                local_ip: detect_local_ip(),
                offline: g.offline,
            },
            Err(_) => MsgIdentity {
                public_key: String::new(),
                fingerprint: String::new(),
                display_name: String::new(),
                listen_port: 0,
                local_ip: None,
                offline: false,
            },
        }
    }

    fn set_listen_port(&self, port: u16) {
        if let Ok(mut g) = self.identity.lock() {
            g.listen_port = port;
        }
    }

    fn listen_port_value(&self) -> u16 {
        self.identity.lock().map(|g| g.listen_port).unwrap_or(0)
    }

    fn display_name(&self) -> String {
        self.identity.lock().map(|g| g.display_name.clone()).unwrap_or_default()
    }

    fn instance_name(&self) -> String {
        let hexed = self.identity.lock().map(|g| hex::encode(&g.public_key)).unwrap_or_default();
        let short: String = hexed.chars().take(8).collect();
        if short.is_empty() { "genisys".to_string() } else { format!("genisys-{short}") }
    }

    pub(crate) fn private_key(&self) -> Vec<u8> {
        self.identity.lock().map(|g| g.private_key.clone()).unwrap_or_default()
    }

    pub(crate) fn our_pub_bytes(&self) -> Vec<u8> {
        self.identity.lock().map(|g| g.public_key.clone()).unwrap_or_default()
    }

    pub(crate) fn our_pub_b64(&self) -> String {
        STANDARD.encode(self.our_pub_bytes())
    }

    pub(crate) fn build_hello(&self) -> Hello {
        match self.identity.lock() {
            Ok(g) => Hello {
                display_name: g.display_name.clone(),
                listen_port: g.listen_port,
                public_key_b64: STANDARD.encode(&g.public_key),
            },
            Err(_) => Hello { display_name: String::new(), listen_port: 0, public_key_b64: String::new() },
        }
    }

    fn set_display_name_internal(&self, name: &str) -> Result<(), String> {
        let pub_b64 = {
            let mut g = self.identity.lock().map_err(|_| "identity lock poisoned".to_string())?;
            g.display_name = name.to_string();
            STANDARD.encode(&g.public_key)
        };
        save_display_name(name, &pub_b64)?;
        if let Ok(slot) = self.mdns.lock() {
            if let Some(daemon) = slot.as_ref() {
                let _ = advertise(daemon, &self.instance_name(), self.listen_port_value(), &pub_b64, name);
            }
        }
        Ok(())
    }

    fn peers_snapshot(&self) -> Vec<MsgPeer> {
        let mut out: Vec<MsgPeer> = Vec::new();
        let mut connected: std::collections::HashSet<String> = std::collections::HashSet::new();
        if let Ok(s) = self.sessions.lock() {
            for (id, handle) in s.iter() {
                connected.insert(id.clone());
                out.push(handle.peer.clone());
            }
        }
        if let Ok(d) = self.discovered.lock() {
            for (id, peer) in d.iter() {
                if !connected.contains(id) {
                    out.push(peer.clone());
                }
            }
        }
        out
    }

    fn resolve_target(
        &self,
        peer_id: &Option<String>,
        host: &Option<String>,
        port: Option<u16>,
    ) -> Result<(String, u16), String> {
        if let Some(id) = peer_id {
            if let Some(peer) = self.discovered_clone(id) {
                return Ok((peer.host, peer.port));
            }
        }
        match (host, port) {
            (Some(h), Some(p)) if !h.is_empty() && p > 0 => Ok((h.clone(), p)),
            _ => Err("no connection target: provide a known peerId or host+port".to_string()),
        }
    }

    fn discovered_clone(&self, id: &str) -> Option<MsgPeer> {
        self.discovered.lock().ok().and_then(|d| d.get(id).cloned())
    }

    pub(crate) fn trust_verified(&self, peer_id: &str) -> bool {
        self.trust_store
            .lock()
            .ok()
            .and_then(|t| t.get(peer_id).map(|e| e.verified))
            .unwrap_or(false)
    }

    pub(crate) fn record_trust(&self, peer_id: &str, display_name: &str) {
        let snapshot = {
            let mut t = match self.trust_store.lock() {
                Ok(g) => g,
                Err(_) => return,
            };
            let entry = t.entry(peer_id.to_string()).or_default();
            entry.display_name = display_name.to_string();
            t.clone()
        };
        let _ = save_trust_store(&snapshot);
    }

    pub(crate) fn check_host_key_changed(&self, host: &str, peer_id: &str) -> bool {
        let mut m = match self.host_keys.lock() {
            Ok(g) => g,
            Err(_) => return false,
        };
        let changed = m.get(host).map(|prev| prev != peer_id).unwrap_or(false);
        m.insert(host.to_string(), peer_id.to_string());
        changed
    }

    pub(crate) fn insert_session(&self, handle: SessionHandle) {
        if let Ok(mut s) = self.sessions.lock() {
            s.insert(handle.peer.id.clone(), handle);
        }
    }

    pub(crate) fn remove_session(&self, peer_id: &str) -> Option<SessionHandle> {
        self.sessions.lock().ok().and_then(|mut s| s.remove(peer_id))
    }

    pub(crate) fn register_request(&self, peer_id: &str, tx: oneshot::Sender<bool>) {
        if let Ok(mut r) = self.pending_requests.lock() {
            r.insert(peer_id.to_string(), tx);
        }
    }

    pub(crate) fn take_request(&self, peer_id: &str) -> Option<oneshot::Sender<bool>> {
        self.pending_requests.lock().ok().and_then(|mut r| r.remove(peer_id))
    }

    fn set_accept_handle(&self, handle: JoinHandle<()>) {
        if let Ok(mut h) = self.accept_handle.lock() {
            if let Some(old) = h.replace(handle) {
                old.abort();
            }
        }
    }

    fn abort_accept(&self) {
        if let Ok(mut h) = self.accept_handle.lock() {
            if let Some(old) = h.take() {
                old.abort();
            }
        }
    }

    /// Record the offline flag in both the atomic (fast path) and the identity
    /// snapshot (what the frontend reads).
    fn set_offline_flag(&self, offline: bool) {
        self.offline.store(offline, Ordering::SeqCst);
        if let Ok(mut g) = self.identity.lock() {
            g.offline = offline;
        }
    }

    /// Tear down all network presence: drop the mDNS daemon (which unregisters
    /// our advertisement and stops the browse task), abort the inbound accept
    /// loop, clear discovered peers and reset the listen port. Open sessions
    /// are left untouched.
    fn go_offline(&self) {
        if let Ok(mut slot) = self.mdns.lock() {
            *slot = None;
        }
        self.abort_accept();
        if let Ok(mut d) = self.discovered.lock() {
            d.clear();
        }
        self.set_listen_port(0);
        self.started.store(false, Ordering::SeqCst);
    }

    fn replace_identity(&self, private_key: Vec<u8>, public_key: Vec<u8>) {
        if let Ok(mut g) = self.identity.lock() {
            g.fingerprint = fingerprint(&public_key);
            g.private_key = private_key;
            g.public_key = public_key;
            g.loaded = true;
        }
    }

    fn send_wire(&self, peer_id: &str, wire: WireMessage) -> Result<(), String> {
        let tx = {
            let s = self.sessions.lock().map_err(|_| "sessions lock poisoned".to_string())?;
            s.get(peer_id).map(|h| h.tx.clone())
        };
        match tx {
            Some(tx) => tx.send(wire).map_err(|_| "session closed".to_string()),
            None => Err("peer not connected".to_string()),
        }
    }

    fn mark_verified(&self, peer_id: &str) -> Result<MsgPeer, String> {
        let snapshot = {
            let mut t = self.trust_store.lock().map_err(|_| "trust lock poisoned".to_string())?;
            t.entry(peer_id.to_string()).or_default().verified = true;
            t.clone()
        };
        let _ = save_trust_store(&snapshot);
        let display_name = snapshot.get(peer_id).map(|e| e.display_name.clone()).unwrap_or_default();

        if let Ok(mut s) = self.sessions.lock() {
            if let Some(handle) = s.get_mut(peer_id) {
                handle.peer.verified = true;
                return Ok(handle.peer.clone());
            }
        }
        if let Ok(mut d) = self.discovered.lock() {
            if let Some(peer) = d.get_mut(peer_id) {
                peer.verified = true;
                return Ok(peer.clone());
            }
        }
        Ok(MsgPeer {
            id: peer_id.to_string(),
            public_key: String::new(),
            display_name,
            host: String::new(),
            port: 0,
            status: "disconnected".to_string(),
            verified: true,
            key_changed: false,
            safety_number: None,
        })
    }

    pub(crate) fn upsert_discovered(&self, peer: MsgPeer) {
        if let Ok(mut d) = self.discovered.lock() {
            d.insert(peer.id.clone(), peer);
        }
    }

    pub(crate) fn remove_discovered_by_fullname(&self, fullname: &str) -> Option<String> {
        let peer_id = self.mdns_names.lock().ok().and_then(|mut m| m.remove(fullname))?;
        if let Ok(mut d) = self.discovered.lock() {
            d.remove(&peer_id);
        }
        Some(peer_id)
    }

    pub(crate) fn record_mdns_name(&self, fullname: &str, peer_id: &str) {
        if let Ok(mut m) = self.mdns_names.lock() {
            m.insert(fullname.to_string(), peer_id.to_string());
        }
    }

    /// Drop all LAN-discovered peers and the mDNS fullname bookkeeping so a
    /// refreshed browse rebuilds the list from live responses. Used by
    /// `rotate` to avoid carrying stale peers — or our own previous
    /// advertisement — across an identity change.
    pub(crate) fn clear_discovery_state(&self) {
        if let Ok(mut d) = self.discovered.lock() {
            d.clear();
        }
        if let Ok(mut m) = self.mdns_names.lock() {
            m.clear();
        }
    }
}
