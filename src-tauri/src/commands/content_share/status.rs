use serde_json::{json, Value};
use tauri::State;

use super::state::ContentShareManager;

/// Current service status: running flag, this device's id + name, LAN ip/port,
/// and the list of discovered peer devices.
#[tauri::command]
pub async fn cmd_content_share_status(
    manager: State<'_, ContentShareManager>,
) -> Result<Value, String> {
    Ok(json!({ "success": true, "data": manager.status() }))
}
