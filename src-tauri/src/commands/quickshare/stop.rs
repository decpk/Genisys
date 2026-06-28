use serde_json::{json, Value};
use tauri::State;

use super::server::stop_server;
use super::state::QuickShareManager;

/// Stop sharing: disconnect all devices and shut the server down. No-op when not
/// running. Files already saved under Downloads/QuickShare are left in place.
#[tauri::command]
pub async fn cmd_quickshare_stop(manager: State<'_, QuickShareManager>) -> Result<Value, String> {
    stop_server(manager.inner().clone()).await;
    Ok(json!({ "success": true }))
}
