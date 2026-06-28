use serde_json::{json, Value};
use tauri::State;

use super::state::ContentShareManager;

/// Rename this device as shown in other devices' pickers. Persisted; takes
/// effect on the next advertise (restart sharing to re-broadcast immediately).
#[tauri::command]
pub async fn cmd_content_share_set_device_name(
    manager: State<'_, ContentShareManager>,
    name: String,
) -> Result<Value, String> {
    manager.set_device_name(&name);
    Ok(json!({ "success": true, "data": manager.device_name() }))
}
