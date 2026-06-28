use crate::commands::AppState;
use crate::database::remove_clipboard_item_db;
use serde_json::Value;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn cmd_remove_clipboard_item(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
) -> Value {
    if let Some((image_path, thumbnail_path)) = remove_clipboard_item_db(&state.db, &id) {
        if let Ok(data_dir) = app.path().app_data_dir() {
            let images_dir = data_dir.join("clipboard-images");
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
