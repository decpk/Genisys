use crate::commands::AppState;
use crate::commands::clipboard::ClipboardMonitorControl;
use crate::database::clear_clipboard_items_db;
use serde_json::Value;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub fn cmd_clear_clipboard_items(
    app: AppHandle,
    state: State<'_, AppState>,
    monitor_control: State<'_, Arc<ClipboardMonitorControl>>,
    include_pinned: Option<bool>,
) -> Value {
    // Suppress the clipboard monitor so it doesn't re-save the current
    // system clipboard content right after we delete items.
    monitor_control.suppress_for(5000);

    // Also clear the current OS clipboard payload to prevent the watcher
    // from re-ingesting the same content after suppression expires.
    let _ = app.clipboard().write_text("");

    let include_pinned = include_pinned.unwrap_or(false);
    let removed_paths = clear_clipboard_items_db(&state.db, include_pinned);

    if let Ok(data_dir) = app.path().app_data_dir() {
        let images_dir = data_dir.join("clipboard-images");
        for (image_path, thumbnail_path) in &removed_paths {
            if let Some(filename) = image_path {
                let _ = std::fs::remove_file(images_dir.join(filename));
            }
            if let Some(thumb) = thumbnail_path {
                let _ = std::fs::remove_file(images_dir.join(thumb));
            }
        }
    }

    serde_json::json!({ "success": true })
}
