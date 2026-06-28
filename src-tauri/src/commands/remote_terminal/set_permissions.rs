use serde_json::{json, Value};
use tauri::State;

use super::state::RemoteTerminalManager;
use super::types::RemotePermissions;

/// Replace the device permissions advertised to (and enforced for) approved
/// remote clients. Pushed by the desktop Terminal app's Share panel whenever the
/// host flips a toggle (and once on start), so every connected browser instantly
/// shows or hides its new-tab (+) and close (x) controls and the server begins
/// rejecting any action the host has disabled.
#[tauri::command]
pub async fn cmd_remote_terminal_set_permissions(
    manager: State<'_, RemoteTerminalManager>,
    permissions: RemotePermissions,
) -> Result<Value, String> {
    manager.set_permissions(permissions);
    Ok(json!({ "success": true }))
}
