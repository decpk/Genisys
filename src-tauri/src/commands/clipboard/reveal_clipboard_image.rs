use serde_json::Value;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

use super::utils::resolve_clipboard_image_path::resolve_clipboard_image_path;

/// Reveal a stored clipboard image in the system file manager
/// (Finder on macOS, Explorer on Windows, native file manager on Linux).
///
/// Accepts the bare filename stored on the frontend (`ClipboardItem.imagePath`),
/// resolves it to the absolute path inside `<app_data_dir>/clipboard-images/`,
/// and asks the `tauri-plugin-opener` plugin to highlight the file.
#[tauri::command]
pub fn cmd_reveal_clipboard_image(app: AppHandle, image_path: String) -> Value {
    let full_path = match resolve_clipboard_image_path(&app, &image_path) {
        Ok(p) => p,
        Err(e) => return serde_json::json!({ "success": false, "error": e }),
    };

    if !full_path.exists() {
        return serde_json::json!({
            "success": false,
            "error": "image file no longer exists on disk"
        });
    }

    let path_str = full_path.to_string_lossy().to_string();
    match app.opener().reveal_item_in_dir(&path_str) {
        Ok(()) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({
            "success": false,
            "error": format!("reveal failed: {e}")
        }),
    }
}
