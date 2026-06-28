use serde_json::{json, Value};
use tauri::State;

use super::state::ContentShareManager;

/// List the Genisys devices currently discovered on the LAN.
#[tauri::command]
pub async fn cmd_content_share_list_devices(
    manager: State<'_, ContentShareManager>,
) -> Result<Value, String> {
    Ok(json!({ "success": true, "data": manager.list_peers() }))
}
