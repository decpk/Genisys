use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::commands::AppState;

use super::server::start_server;
use super::state::ContentShareManager;

/// Start the Content Share service: bind the LAN HTTP server and begin mDNS
/// advertise + discovery. Returns the current status. Idempotent.
#[tauri::command]
pub async fn cmd_content_share_start(
    app: AppHandle,
    manager: State<'_, ContentShareManager>,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    match start_server(app, manager.inner().clone(), state.db.clone()).await {
        Ok(status) => Ok(json!({ "success": true, "data": status })),
        Err(error) => Ok(json!({ "success": false, "error": error })),
    }
}
