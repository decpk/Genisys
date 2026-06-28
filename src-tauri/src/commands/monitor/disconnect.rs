use serde_json::{json, Value};
use tauri::State;

use super::state::MonitorManager;

/// Forcibly disconnect a connected viewer by id. Its bridge task stops and the
/// socket closes; the desktop tears down the matching peer connection.
#[tauri::command]
pub async fn cmd_monitor_disconnect(
    manager: State<'_, MonitorManager>,
    client_id: String,
) -> Result<Value, String> {
    match manager.client_close(&client_id) {
        Some(close) => {
            let _ = close.send(true);
            Ok(json!({ "success": true }))
        }
        None => Ok(json!({ "success": false, "error": "client not found" })),
    }
}
