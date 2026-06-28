//! Runtime state for the QuickShare server: lifecycle, the active access token,
//! the shared tray (files + text), connected devices, and a broadcast channel
//! that fans tray/peer changes out to every connected browser. A cloneable
//! handle over a shared `Arc<Mutex<..>>` so commands, the server task, and
//! per-socket loops all observe the same state.

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use tokio::sync::{broadcast, mpsc, oneshot, watch};

use super::auth::constant_time_eq;
use super::types::{ClientInfo, QuickShareStatus, ServerMessage, TrayItem};

/// Broadcast backlog kept per receiver before it is forced to lag. Signals are
/// tiny and idempotent (each socket recomputes its own view), so a modest
/// buffer is plenty.
const BROADCAST_CAPACITY: usize = 64;

/// A "something changed" notification fanned out to every connected socket. The
/// payload is intentionally minimal — each socket rebuilds the concrete message
/// it should send (the tray is filtered per recipient, so it cannot be a single
/// shared pre-serialized blob).
#[derive(Debug, Clone, Copy)]
pub enum Signal {
    /// The shared tray changed; sockets should re-send their filtered tray.
    Tray,
    /// The connected-peer list changed; sockets should re-send the peer list.
    Clients,
}

struct ClientEntry {
    info: ClientInfo,
    /// Latching close signal for this client's socket task. `send(true)` tells
    /// the loop to stop and close the socket.
    close: watch::Sender<bool>,
    /// Directed outbound queue for this socket — used to relay WebRTC signaling
    /// blobs to a specific device (the broadcast channel can't target one peer).
    tx: mpsc::UnboundedSender<ServerMessage>,
}

/// An in-progress parallel (chunked) upload. The bytes land directly at their
/// offsets in a single temp file across several concurrent connections; once
/// every chunk index has arrived the file is renamed to its final name.
struct UploadSession {
    temp_path: PathBuf,
    total: u64,
    chunks: u32,
    received: HashSet<u32>,
    /// Set for *live-relay* uploads (a chunked transfer addressed to a specific
    /// device): the announced tray item id (which equals the upload id). The
    /// bytes are written straight to their final path and the recipient may pull
    /// each slice as soon as it arrives — overlapping the two LAN hops instead of
    /// waiting for the whole upload to land first. `None` for ordinary chunked
    /// uploads, which are only published once complete.
    item_id: Option<String>,
    /// Per-chunk byte size, so the download route can map a requested byte range
    /// back to a chunk index and tell whether that slice has arrived yet.
    chunk_size: u64,
}

/// Whether a byte range of an in-flight live-relay upload can be served yet.
pub enum RelayRange {
    /// Every chunk covering the requested range has arrived — serve it.
    Available,
    /// At least one covering chunk is still in flight — the client should retry.
    TooEarly,
}

/// Outcome of trying to finalize a chunked upload.
pub enum UploadTake {
    /// All chunks arrived — here is the temp file + total size to rename/publish.
    Complete { temp_path: PathBuf, total: u64 },
    /// Some chunks are still missing; the client should retry then finish again.
    Incomplete,
    /// No such upload id (already finished/aborted, or never started).
    Missing,
}

#[derive(Default)]
struct QuickShareState {
    running: bool,
    ip: Option<String>,
    port: u16,
    token: String,
    storage_dir: Option<String>,
    shutdown_tx: Option<oneshot::Sender<()>>,
    clients: HashMap<String, ClientEntry>,
    items: Vec<TrayItem>,
    /// In-flight chunked uploads, keyed by client-supplied upload id.
    uploads: HashMap<String, UploadSession>,
}

#[derive(Clone)]
pub struct QuickShareManager {
    inner: Arc<Mutex<QuickShareState>>,
    /// Fan-out of change `Signal`s; each socket rebuilds its own view on receipt.
    broadcast: broadcast::Sender<Signal>,
}

impl Default for QuickShareManager {
    fn default() -> Self {
        let (broadcast, _) = broadcast::channel(BROADCAST_CAPACITY);
        Self {
            inner: Arc::new(Mutex::new(QuickShareState::default())),
            broadcast,
        }
    }
}

impl QuickShareManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_running(&self) -> bool {
        self.inner.lock().map(|s| s.running).unwrap_or(false)
    }

    /// Record that the server has started and take ownership of its
    /// graceful-shutdown trigger. Resets the tray for the fresh session.
    pub fn mark_started(
        &self,
        ip: String,
        port: u16,
        token: String,
        storage_dir: String,
        shutdown_tx: oneshot::Sender<()>,
    ) {
        if let Ok(mut s) = self.inner.lock() {
            s.running = true;
            s.ip = Some(ip);
            s.port = port;
            s.token = token;
            s.storage_dir = Some(storage_dir);
            s.shutdown_tx = Some(shutdown_tx);
            s.items.clear();
        }
    }

    /// Drain state for shutdown: returns the graceful-shutdown sender plus every
    /// client's close signal so the caller can disconnect them, and clears the
    /// tray. The auto-saved files in the Downloads folder are left in place.
    /// Idempotent.
    pub fn take_for_stop(&self) -> (Option<oneshot::Sender<()>>, Vec<watch::Sender<bool>>) {
        let mut closes = Vec::new();
        let mut shutdown = None;
        if let Ok(mut s) = self.inner.lock() {
            shutdown = s.shutdown_tx.take();
            for (_, entry) in s.clients.drain() {
                closes.push(entry.close);
            }
            // Discard any half-finished chunked uploads and their temp files.
            for (_, sess) in s.uploads.drain() {
                let _ = std::fs::remove_file(&sess.temp_path);
            }
            s.items.clear();
            s.running = false;
            s.token.clear();
            s.ip = None;
            s.port = 0;
            s.storage_dir = None;
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

    /// The absolute path of the folder where uploads are auto-saved.
    pub fn storage_dir(&self) -> Option<String> {
        self.inner.lock().ok().and_then(|s| s.storage_dir.clone())
    }

    /// Snapshot the current server status for the desktop UI.
    pub fn status(&self) -> QuickShareStatus {
        match self.inner.lock() {
            Ok(s) => {
                let url = match (&s.ip, s.running) {
                    (Some(ip), true) => Some(format!("http://{}:{}/?token={}", ip, s.port, s.token)),
                    _ => None,
                };
                QuickShareStatus {
                    running: s.running,
                    url,
                    ip: s.ip.clone(),
                    port: if s.running { Some(s.port) } else { None },
                    token: if s.running { Some(s.token.clone()) } else { None },
                    storage_dir: s.storage_dir.clone(),
                    clients: s.clients.values().map(|c| c.info.clone()).collect(),
                    items: s.items.clone(),
                }
            }
            Err(_) => QuickShareStatus {
                running: false,
                url: None,
                ip: None,
                port: None,
                token: None,
                storage_dir: None,
                clients: Vec::new(),
                items: Vec::new(),
            },
        }
    }

    pub fn register_client(
        &self,
        info: ClientInfo,
        close: watch::Sender<bool>,
        tx: mpsc::UnboundedSender<ServerMessage>,
    ) {
        if let Ok(mut s) = self.inner.lock() {
            s.clients
                .insert(info.client_id.clone(), ClientEntry { info, close, tx });
        }
    }

    /// Deliver a directed message to every open socket of a device (a device may
    /// have several tabs/reconnects). Used to relay WebRTC signaling between two
    /// browsers; a closed receiver is ignored (the socket is on its way out).
    pub fn send_to_device(&self, device_id: &str, msg: ServerMessage) {
        if let Ok(s) = self.inner.lock() {
            for entry in s.clients.values() {
                if entry.info.device_id == device_id {
                    let _ = entry.tx.send(msg.clone());
                }
            }
        }
    }

    pub fn unregister_client(&self, client_id: &str) {
        if let Ok(mut s) = self.inner.lock() {
            s.clients.remove(client_id);
        }
    }

    pub fn snapshot_clients(&self) -> Vec<ClientInfo> {
        match self.inner.lock() {
            Ok(s) => s.clients.values().map(|c| c.info.clone()).collect(),
            Err(_) => Vec::new(),
        }
    }

    pub fn snapshot_items(&self) -> Vec<TrayItem> {
        match self.inner.lock() {
            Ok(s) => s.items.clone(),
            Err(_) => Vec::new(),
        }
    }

    /// Tray items visible to a specific device: those addressed to everyone, to
    /// this device, or sent by it. Used to build each socket's personalized view.
    pub fn snapshot_items_for(&self, device_id: &str) -> Vec<TrayItem> {
        match self.inner.lock() {
            Ok(s) => s
                .items
                .iter()
                .filter(|i| i.visible_to(device_id))
                .cloned()
                .collect(),
            Err(_) => Vec::new(),
        }
    }

    /// Append a new item to the shared tray.
    pub fn add_item(&self, item: TrayItem) {
        if let Ok(mut s) = self.inner.lock() {
            s.items.push(item);
        }
    }

    /// Remove an item from the tray by id. Returns whether one was removed. The
    /// underlying file (if any) is left on disk.
    pub fn remove_item(&self, item_id: &str) -> bool {
        if let Ok(mut s) = self.inner.lock() {
            let before = s.items.len();
            s.items.retain(|i| i.id != item_id);
            return s.items.len() != before;
        }
        false
    }

    /// Remove every item from the tray, returning how many were cleared. The
    /// underlying saved files (if any) are left on disk — only sharing stops.
    pub fn clear_items(&self) -> usize {
        if let Ok(mut s) = self.inner.lock() {
            let count = s.items.len();
            s.items.clear();
            return count;
        }
        0
    }

    /// Look up a tray item by id (used by the download route).
    pub fn get_item(&self, item_id: &str) -> Option<TrayItem> {
        let s = self.inner.lock().ok()?;
        s.items.iter().find(|i| i.id == item_id).cloned()
    }

    /// Ensure a chunked-upload session exists and return its temp file path.
    /// The first chunk to arrive creates the (sparse, pre-sized) temp file; all
    /// later chunks for the same id reuse it. The temp name is derived from the
    /// upload id, so concurrent first-chunks can't race on the filename.
    pub fn upload_prepare(
        &self,
        upload_id: &str,
        storage_dir: &str,
        total: u64,
        chunks: u32,
    ) -> Result<PathBuf, String> {
        let mut s = self.inner.lock().map_err(|_| "state poisoned".to_string())?;
        if let Some(sess) = s.uploads.get(upload_id) {
            return Ok(sess.temp_path.clone());
        }
        let safe_id: String = upload_id
            .chars()
            .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
            .take(64)
            .collect();
        if safe_id.is_empty() {
            return Err("invalid upload id".to_string());
        }
        let temp_path = PathBuf::from(storage_dir).join(format!(".quickshare-{safe_id}.part"));
        let file = std::fs::File::create(&temp_path)
            .map_err(|e| format!("failed to create upload file: {e}"))?;
        // Pre-size so out-of-order offset writes land in an existing region.
        let _ = file.set_len(total);
        s.uploads.insert(
            upload_id.to_string(),
            UploadSession {
                temp_path: temp_path.clone(),
                total,
                chunks,
                received: HashSet::new(),
                item_id: None,
                chunk_size: 0,
            },
        );
        Ok(temp_path)
    }

    /// Begin a *live-relay* upload (a chunked transfer addressed to one device):
    /// create the destination file up front (pre-sized so out-of-order offset
    /// writes land) and register a session whose already-arrived slices a
    /// recipient may stream while the rest is still uploading. The bytes are
    /// written straight to their final path — no temp/rename — so a reader can
    /// follow the file safely across platforms. Idempotent for a given id.
    pub fn upload_begin(
        &self,
        upload_id: &str,
        dest: &std::path::Path,
        total: u64,
        chunks: u32,
        chunk_size: u64,
    ) -> Result<(), String> {
        let mut s = self.inner.lock().map_err(|_| "state poisoned".to_string())?;
        if s.uploads.contains_key(upload_id) {
            return Ok(());
        }
        let file =
            std::fs::File::create(dest).map_err(|e| format!("failed to create upload file: {e}"))?;
        let _ = file.set_len(total);
        s.uploads.insert(
            upload_id.to_string(),
            UploadSession {
                temp_path: dest.to_path_buf(),
                total,
                chunks,
                received: HashSet::new(),
                item_id: Some(upload_id.to_string()),
                chunk_size: chunk_size.max(1),
            },
        );
        Ok(())
    }

    /// For an in-flight live-relay item, report whether the requested byte range
    /// (or the whole file, when `range` is `None`) has fully arrived. Returns
    /// `None` when `item_id` is not an active live relay (a legacy upload, or one
    /// already finalized), so the caller just serves it normally from disk.
    pub fn relay_range_state(
        &self,
        item_id: &str,
        range: Option<(u64, u64)>,
    ) -> Option<RelayRange> {
        let s = self.inner.lock().ok()?;
        let sess = s.uploads.get(item_id)?;
        // `None` item_id => an ordinary chunked upload, not a live relay.
        sess.item_id.as_deref()?;
        let cs = sess.chunk_size.max(1);
        let (start, end) = match range {
            Some((a, b)) => (a, b),
            None => (0, sess.total.saturating_sub(1)),
        };
        let first = start / cs;
        let last = end / cs;
        let mut k = first;
        while k <= last {
            if !sess.received.contains(&(k as u32)) {
                return Some(RelayRange::TooEarly);
            }
            k += 1;
        }
        Some(RelayRange::Available)
    }

    /// Record that a chunk index finished writing. Returns false if the upload
    /// id is unknown.
    pub fn upload_mark(&self, upload_id: &str, index: u32) -> bool {
        if let Ok(mut s) = self.inner.lock() {
            if let Some(sess) = s.uploads.get_mut(upload_id) {
                sess.received.insert(index);
                return true;
            }
        }
        false
    }

    /// Try to finalize: if every chunk index has arrived, remove and return the
    /// session so the caller can rename the temp file and publish the item.
    pub fn upload_take_if_complete(&self, upload_id: &str) -> UploadTake {
        let mut s = match self.inner.lock() {
            Ok(s) => s,
            Err(_) => return UploadTake::Missing,
        };
        match s.uploads.get(upload_id) {
            Some(sess) if (sess.received.len() as u32) >= sess.chunks => {
                let sess = s.uploads.remove(upload_id).expect("just checked");
                UploadTake::Complete {
                    temp_path: sess.temp_path,
                    total: sess.total,
                }
            }
            Some(_) => UploadTake::Incomplete,
            None => UploadTake::Missing,
        }
    }

    /// Abort an in-flight upload: drop the session and delete its temp file.
    pub fn upload_abort(&self, upload_id: &str) {
        let temp = self
            .inner
            .lock()
            .ok()
            .and_then(|mut s| s.uploads.remove(upload_id))
            .map(|sess| sess.temp_path);
        if let Some(path) = temp {
            let _ = std::fs::remove_file(path);
        }
    }

    /// Subscribe to the fan-out stream of change `Signal`s.
    pub fn subscribe(&self) -> broadcast::Receiver<Signal> {
        self.broadcast.subscribe()
    }

    /// Notify every connected socket that something changed. The absence of
    /// receivers is a silent no-op.
    pub fn signal(&self, sig: Signal) {
        let _ = self.broadcast.send(sig);
    }
}
