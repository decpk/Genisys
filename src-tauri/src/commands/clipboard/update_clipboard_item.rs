use crate::commands::AppState;
use crate::database::{update_clipboard_text_db, update_clipboard_image_description_db};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_update_clipboard_text(
    state: State<'_, AppState>,
    id: String,
    text_content: String,
) -> Value {
    update_clipboard_text_db(&state.db, &id, &text_content);
    serde_json::json!({ "success": true })
}

#[tauri::command]
pub fn cmd_update_clipboard_image_description(
    state: State<'_, AppState>,
    id: String,
    description: String,
) -> Value {
    update_clipboard_image_description_db(&state.db, &id, &description, "done");
    serde_json::json!({ "success": true })
}
