//! `cmd_quickshare_remove_item` — remove an item from the shared tray. The
//! underlying saved file (if any) is left on disk; only sharing stops.

use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::events::fan_out_tray;
use super::state::QuickShareManager;

#[tauri::command]
pub async fn cmd_quickshare_remove_item(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
    item_id: String,
) -> Result<Value, String> {
    let removed = manager.remove_item(&item_id);
    if removed {
        fan_out_tray(&app, manager.inner());
    }
    Ok(json!({ "success": removed }))
}
