use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::server::start_server;
use super::state::QuickShareManager;

/// Start QuickShare sharing over the LAN. Returns the QR URL (with embedded
/// token), the LAN IP, the bound port, the token, and the Downloads/QuickShare
/// folder where received files are saved.
#[tauri::command]
pub async fn cmd_quickshare_start(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
    port: Option<u16>,
) -> Result<Value, String> {
    match start_server(app, manager.inner().clone(), port).await {
        Ok(info) => Ok(json!({ "success": true, "data": info })),
        Err(error) => Ok(json!({ "success": false, "error": error })),
    }
}
