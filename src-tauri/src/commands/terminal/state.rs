use std::collections::{HashMap, VecDeque};
use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use portable_pty::{Child, MasterPty};
use tokio::sync::broadcast;

use super::types::TerminalSession;

/// Capacity of each session's output broadcast channel. Only remote-terminal
/// mirror subscribers read from it (the desktop UI keeps using Tauri events),
/// so this buffers PTY chunks for any attached LAN clients that briefly lag.
const OUTPUT_CHANNEL_CAPACITY: usize = 1024;

/// Soft cap on retained scrollback per session (raw PTY bytes). Replayed to a
/// remote-terminal mirror client on attach so it can scroll back through output
/// that predates its connection. ~1 MiB comfortably covers the desktop xterm's
/// 5000-line scrollback for typical output; oldest whole chunks are evicted
/// first so an escape sequence is never split mid-eviction.
const HISTORY_CAP_BYTES: usize = 1024 * 1024;

/// Bounded ring of recent raw PTY output chunks for one session. Populated by
/// the reader loop only while remote sharing is active (see
/// [`TerminalManager::set_history_capture`]) and snapshotted on remote attach.
#[derive(Default)]
pub struct OutputHistory {
    chunks: VecDeque<Vec<u8>>,
    bytes: usize,
}

impl OutputHistory {
    /// Append a chunk, evicting oldest chunks until within the byte cap.
    pub fn push(&mut self, chunk: Vec<u8>) {
        self.bytes += chunk.len();
        self.chunks.push_back(chunk);
        while self.bytes > HISTORY_CAP_BYTES {
            match self.chunks.pop_front() {
                Some(old) => self.bytes -= old.len(),
                None => break,
            }
        }
    }

    /// Flatten the retained history into one contiguous buffer (replay payload).
    fn snapshot(&self) -> Vec<u8> {
        let mut out = Vec::with_capacity(self.bytes);
        for chunk in &self.chunks {
            out.extend_from_slice(chunk);
        }
        out
    }

    /// Drop all retained bytes (memory reclaim when sharing stops).
    fn clear(&mut self) {
        self.chunks.clear();
        self.bytes = 0;
    }
}

/// Per-session handle. Reader thread runs in `tokio::task::spawn_blocking` and
/// owns its own clone-of-reader; the master/writer/child live here so commands
/// can write input, resize, and kill.
pub struct SessionHandle {
    pub meta: TerminalSession,
    pub master: Box<dyn MasterPty + Send>,
    pub writer: Box<dyn Write + Send>,
    pub child: Box<dyn Child + Send + Sync>,
    /// Fan-out of raw PTY bytes to remote-terminal mirror subscribers. The
    /// desktop UI does NOT use this (it consumes the `terminal-output` Tauri
    /// event); it stays dormant — and allocation-free — until a LAN client
    /// attaches. Kept here so `subscribe_with_history()` can hand out new
    /// receivers.
    pub output_tx: broadcast::Sender<Vec<u8>>,
    /// Bounded scrollback ring (raw PTY bytes) shared with this session's reader
    /// loop (which appends) and the remote bridge (which snapshots it on attach
    /// to replay history). Only populated while `TerminalManager` history
    /// capture is on (remote sharing active).
    pub history: Arc<Mutex<OutputHistory>>,
}

impl SessionHandle {
    /// Create a fresh output broadcast channel for a new session. Returns the
    /// sender to embed in the handle; the reader loop clones it to publish.
    pub fn new_output_channel() -> broadcast::Sender<Vec<u8>> {
        broadcast::channel(OUTPUT_CHANNEL_CAPACITY).0
    }
}

#[derive(Clone)]
pub struct TerminalManager {
    sessions: Arc<Mutex<HashMap<String, SessionHandle>>>,
    /// Fires whenever the set of live sessions changes (insert/remove/kill) so
    /// remote-terminal clients can refresh their tab list live.
    changed: broadcast::Sender<()>,
    /// Whether reader loops retain scrollback history (true only while the
    /// remote-terminal server is sharing). Cloned into each reader loop as a
    /// cheap per-chunk gate; toggled by the remote start/stop commands.
    capture_history: Arc<AtomicBool>,
}

impl Default for TerminalManager {
    fn default() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            changed: broadcast::channel(16).0,
            capture_history: Arc::new(AtomicBool::new(false)),
        }
    }
}

impl TerminalManager {
    pub fn new() -> Self {
        Self::default()
    }

    fn notify_changed(&self) {
        let _ = self.changed.send(());
    }

    /// Subscribe to "session set changed" notifications (insert/remove/kill).
    pub fn subscribe_changes(&self) -> broadcast::Receiver<()> {
        self.changed.subscribe()
    }

    pub fn insert(&self, handle: SessionHandle) {
        if let Ok(mut map) = self.sessions.lock() {
            map.insert(handle.meta.id.clone(), handle);
        }
        self.notify_changed();
    }

    pub fn remove(&self, id: &str) {
        let mut removed = false;
        if let Ok(mut map) = self.sessions.lock() {
            if let Some(mut h) = map.remove(id) {
                let _ = h.child.kill();
                removed = true;
            }
        }
        if removed {
            self.notify_changed();
        }
    }

    pub fn list(&self) -> Vec<TerminalSession> {
        match self.sessions.lock() {
            Ok(map) => map.values().map(|h| h.meta.clone()).collect(),
            Err(_) => Vec::new(),
        }
    }

    pub fn write(&self, id: &str, bytes: &[u8]) -> Result<(), String> {
        let mut map = self
            .sessions
            .lock()
            .map_err(|e| format!("terminal lock poisoned: {e}"))?;
        let handle = map
            .get_mut(id)
            .ok_or_else(|| format!("session {id} not found"))?;
        handle
            .writer
            .write_all(bytes)
            .map_err(|e| format!("write failed: {e}"))?;
        let _ = handle.writer.flush();
        Ok(())
    }

    pub fn resize(&self, id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let map = self
            .sessions
            .lock()
            .map_err(|e| format!("terminal lock poisoned: {e}"))?;
        let handle = map
            .get(id)
            .ok_or_else(|| format!("session {id} not found"))?;
        handle
            .master
            .resize(portable_pty::PtySize {
                cols,
                rows,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("resize failed: {e}"))
    }

    pub fn kill(&self, id: &str) -> Result<(), String> {
        let removed = {
            let mut map = self
                .sessions
                .lock()
                .map_err(|e| format!("terminal lock poisoned: {e}"))?;
            if let Some(mut h) = map.remove(id) {
                let _ = h.child.kill();
                true
            } else {
                false
            }
        };
        if removed {
            self.notify_changed();
        }
        Ok(())
    }

    /// OS process id of a session's child shell, if still running.
    pub fn pid(&self, id: &str) -> Option<u32> {
        let map = self.sessions.lock().ok()?;
        map.get(id)?.child.process_id()
    }

    /// Whether a live session with this id exists. Used by the remote-terminal
    /// bridge to validate a `mirror` target before attaching.
    pub fn contains(&self, id: &str) -> bool {
        self.sessions
            .lock()
            .map(|m| m.contains_key(id))
            .unwrap_or(false)
    }

    /// Snapshot a single session's metadata, if it still exists. Used by the
    /// remote-terminal bridge to resolve shell/cwd for an advertised tab id.
    pub fn meta(&self, id: &str) -> Option<TerminalSession> {
        let map = self.sessions.lock().ok()?;
        map.get(id).map(|h| h.meta.clone())
    }

    /// Subscribe to a session's live output and atomically snapshot its retained
    /// scrollback, so a freshly-attached remote mirror can replay history and
    /// then continue live with no gap or duplication. Returns
    /// `(history_snapshot, live_receiver)`, or `None` if the session is gone.
    ///
    /// The snapshot and the `subscribe()` happen under the session's history
    /// lock, which the reader loop also holds while it appends-then-broadcasts
    /// each chunk — so every chunk lands either in the snapshot or the live
    /// stream, never both and never neither.
    pub fn subscribe_with_history(
        &self,
        id: &str,
    ) -> Option<(Vec<u8>, broadcast::Receiver<Vec<u8>>)> {
        let map = self.sessions.lock().ok()?;
        let handle = map.get(id)?;
        let hist = handle.history.lock().ok()?;
        let snapshot = hist.snapshot();
        let rx = handle.output_tx.subscribe();
        Some((snapshot, rx))
    }

    /// Clone-handle to the "retain scrollback history" gate, embedded into each
    /// reader loop as a cheap per-chunk check.
    pub fn history_capture_handle(&self) -> Arc<AtomicBool> {
        self.capture_history.clone()
    }

    /// Enable / disable scrollback retention across all sessions. Driven by the
    /// remote-terminal start/stop commands so history is only buffered while a
    /// device may be watching. Disabling also clears every session's buffer to
    /// reclaim memory.
    pub fn set_history_capture(&self, enabled: bool) {
        self.capture_history.store(enabled, Ordering::Relaxed);
        if !enabled {
            if let Ok(map) = self.sessions.lock() {
                for handle in map.values() {
                    if let Ok(mut hist) = handle.history.lock() {
                        hist.clear();
                    }
                }
            }
        }
    }
}
