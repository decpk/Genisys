use serde_json::{json, Value};
use tauri::State;

use super::state::RemoteTerminalManager;

/// Deny a pending remote connection. The waiting WebSocket bridge closes the
/// socket without attaching a session.
#[tauri::command]
pub async fn cmd_remote_terminal_deny(
    manager: State<'_, RemoteTerminalManager>,
    request_id: String,
) -> Result<Value, String> {
    let resolved = manager.resolve_pending(&request_id, false);
    Ok(json!({ "success": resolved }))
}
