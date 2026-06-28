//! `cmd_quickshare_remove_all` — clear the entire shared tray in one go. The
//! underlying saved files (if any) are left on disk; only sharing stops.

use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::events::fan_out_tray;
use super::state::QuickShareManager;

#[tauri::command]
pub async fn cmd_quickshare_remove_all(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
) -> Result<Value, String> {
    let removed = manager.clear_items();
    if removed > 0 {
        fan_out_tray(&app, manager.inner());
    }
    Ok(json!({ "success": true, "data": { "removed": removed } }))
}
