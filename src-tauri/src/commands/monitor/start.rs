use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::server::start_server;
use super::state::MonitorManager;

/// Start sharing the camera + microphone over the LAN. Returns the QR URL (with
/// embedded token), the LAN IP, the bound port, and the access token.
#[tauri::command]
pub async fn cmd_monitor_start(
    app: AppHandle,
    manager: State<'_, MonitorManager>,
    port: Option<u16>,
) -> Result<Value, String> {
    match start_server(app, manager.inner().clone(), port).await {
        Ok(info) => Ok(json!({ "success": true, "data": info })),
        Err(error) => Ok(json!({ "success": false, "error": error })),
    }
}
