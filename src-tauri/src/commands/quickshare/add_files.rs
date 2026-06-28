//! `cmd_quickshare_add_files` — the desktop shares local files into the tray.
//! Files are served in place (no copy); only metadata + the absolute path are
//! recorded, then the tray change is fanned out to every device.

use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::events::fan_out_tray;
use super::state::QuickShareManager;
use super::types::{TrayItem, HOST_SENDER_ID, TARGET_EVERYONE};
use super::util::guess_mime;

const DESKTOP_LABEL: &str = "This device";

#[tauri::command]
pub async fn cmd_quickshare_add_files(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
    paths: Vec<String>,
    target: Option<String>,
) -> Result<Value, String> {
    if !manager.is_running() {
        return Ok(json!({ "success": false, "error": "QuickShare is not running" }));
    }
    let target = target.unwrap_or_else(|| TARGET_EVERYONE.to_string());
    let mut added = 0u32;
    for path in paths {
        let p = std::path::Path::new(&path);
        let name = match p.file_name().and_then(|s| s.to_str()) {
            Some(n) => n.to_string(),
            None => continue,
        };
        let size = std::fs::metadata(p).map(|m| m.len()).unwrap_or(0);
        let mime = guess_mime(&name);
        let item = TrayItem::new_file(
            name,
            size,
            mime,
            DESKTOP_LABEL.to_string(),
            HOST_SENDER_ID.to_string(),
            target.clone(),
            path.clone(),
        );
        manager.add_item(item);
        added += 1;
    }
    if added > 0 {
        fan_out_tray(&app, manager.inner());
    }
    Ok(json!({ "success": true, "data": { "added": added } }))
}
