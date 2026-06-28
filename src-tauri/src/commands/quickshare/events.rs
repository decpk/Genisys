//! Fan-out helpers shared by the WebSocket loop, the upload route, and the
//! desktop commands: push the current tray / peer list to every connected
//! browser (over the broadcast channel) and to the desktop UI (Tauri events).

use tauri::{AppHandle, Emitter};

use super::state::{QuickShareManager, Signal};
use super::types::{ClientsChangedEvent, TrayChangedEvent};

/// Tell every browser socket to refresh its (per-recipient filtered) tray, and
/// push the full tray to the desktop host (which sees everything).
pub fn fan_out_tray(app: &AppHandle, manager: &QuickShareManager) {
    manager.signal(Signal::Tray);
    let items = manager.snapshot_items();
    let _ = app.emit("quickshare-tray-changed", TrayChangedEvent { items });
}

/// Tell every browser socket to refresh the connected-peer list, and push it to
/// the desktop host.
pub fn fan_out_clients(app: &AppHandle, manager: &QuickShareManager) {
    manager.signal(Signal::Clients);
    let clients = manager.snapshot_clients();
    let _ = app.emit("quickshare-clients-changed", ClientsChangedEvent { clients });
}
