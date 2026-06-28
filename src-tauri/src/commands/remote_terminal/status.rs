use serde_json::{json, Value};
use tauri::State;

use super::state::RemoteTerminalManager;

/// Current sharing status: running flag, URL/IP/port/token, and connected
/// clients. Used to hydrate the desktop UI on mount.
#[tauri::command]
pub async fn cmd_remote_terminal_status(
    manager: State<'_, RemoteTerminalManager>,
) -> Result<Value, String> {
    Ok(json!({ "success": true, "data": manager.status() }))
}
