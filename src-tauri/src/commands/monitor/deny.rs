use serde_json::{json, Value};
use tauri::State;

use super::state::MonitorManager;

/// Deny a pending remote connection. The waiting WebSocket bridge closes the
/// socket without streaming.
#[tauri::command]
pub async fn cmd_monitor_deny(
    manager: State<'_, MonitorManager>,
    request_id: String,
) -> Result<Value, String> {
    let resolved = manager.resolve_pending(&request_id, false);
    Ok(json!({ "success": resolved }))
}
