use serde_json::{json, Value};
use tauri::State;

use super::state::QuickShareManager;

/// Current sharing status: running flag, URL/IP/port/token, storage folder,
/// connected devices, and the shared tray. Used to hydrate the desktop UI on
/// mount (e.g. after a hot reload while the server is still running).
#[tauri::command]
pub async fn cmd_quickshare_status(
    manager: State<'_, QuickShareManager>,
) -> Result<Value, String> {
    Ok(json!({ "success": true, "data": manager.status() }))
}
