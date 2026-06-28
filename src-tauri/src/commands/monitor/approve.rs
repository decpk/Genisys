use serde_json::{json, Value};
use tauri::State;

use super::state::MonitorManager;

/// Allow a pending remote connection. The waiting WebSocket bridge proceeds and
/// the desktop starts streaming to it.
#[tauri::command]
pub async fn cmd_monitor_approve(
    manager: State<'_, MonitorManager>,
    request_id: String,
) -> Result<Value, String> {
    let resolved = manager.resolve_pending(&request_id, true);
    Ok(json!({ "success": resolved }))
}
