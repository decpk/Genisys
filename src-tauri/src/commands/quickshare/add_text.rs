//! `cmd_quickshare_add_text` — the desktop shares a text snippet / link into the
//! tray, fanned out to every connected device.

use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::events::fan_out_tray;
use super::state::QuickShareManager;
use super::types::{TrayItem, HOST_SENDER_ID, TARGET_EVERYONE};

const DESKTOP_LABEL: &str = "This device";

#[tauri::command]
pub async fn cmd_quickshare_add_text(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
    text: String,
    target: Option<String>,
) -> Result<Value, String> {
    if !manager.is_running() {
        return Ok(json!({ "success": false, "error": "QuickShare is not running" }));
    }
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return Ok(json!({ "success": false, "error": "empty text" }));
    }
    let target = target.unwrap_or_else(|| TARGET_EVERYONE.to_string());
    let item = TrayItem::new_text(
        trimmed.to_string(),
        DESKTOP_LABEL.to_string(),
        HOST_SENDER_ID.to_string(),
        target,
    );
    manager.add_item(item);
    fan_out_tray(&app, manager.inner());
    Ok(json!({ "success": true }))
}
