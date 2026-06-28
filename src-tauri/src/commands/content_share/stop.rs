use serde_json::{json, Value};
use tauri::State;

use super::server::stop_server;
use super::state::ContentShareManager;

/// Stop the Content Share service: shut the server down and drop the mDNS
/// advertisement. No-op when not running.
#[tauri::command]
pub async fn cmd_content_share_stop(
    manager: State<'_, ContentShareManager>,
) -> Result<Value, String> {
    stop_server(manager.inner().clone()).await;
    Ok(json!({ "success": true }))
}
