use serde_json::{json, Value};
use tauri::State;

use super::server::stop_server;
use super::state::MonitorManager;

/// Stop sharing: disconnect all viewers and shut the server down. No-op when not
/// running. The desktop separately stops its camera + mic capture.
#[tauri::command]
pub async fn cmd_monitor_stop(
    manager: State<'_, MonitorManager>,
) -> Result<Value, String> {
    stop_server(manager.inner().clone()).await;
    Ok(json!({ "success": true }))
}
