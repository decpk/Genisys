use serde_json::{json, Value};
use tauri::State;

use super::state::MonitorManager;

/// Current sharing status: running flag, URL/IP/port/token, and connected
/// viewers. Used to hydrate the desktop UI on mount.
#[tauri::command]
pub async fn cmd_monitor_status(
    manager: State<'_, MonitorManager>,
) -> Result<Value, String> {
    Ok(json!({ "success": true, "data": manager.status() }))
}
