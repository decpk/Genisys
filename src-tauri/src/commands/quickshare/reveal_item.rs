//! `cmd_quickshare_reveal_item` — reveal a shared file in the OS file manager
//! (Finder/Explorer), highlighting it inside its containing folder. Uses the
//! desktop-only `local_path` (never serialized to browsers), so the filesystem
//! path stays server-side.

use serde_json::{json, Value};
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;

use super::state::QuickShareManager;

#[tauri::command]
pub async fn cmd_quickshare_reveal_item(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
    item_id: String,
) -> Result<Value, String> {
    let item = match manager.get_item(&item_id) {
        Some(it) => it,
        None => return Ok(json!({ "success": false, "error": "Item not found" })),
    };
    let path = match item.local_path {
        Some(p) => p,
        None => return Ok(json!({ "success": false, "error": "Item has no file on disk" })),
    };
    app.opener()
        .reveal_item_in_dir(&path)
        .map_err(|e| format!("reveal failed: {e}"))?;
    Ok(json!({ "success": true }))
}
