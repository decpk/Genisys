use crate::commands::AppState;
use crate::database::remove_previewer_preview_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_previewer_remove_preview(state: State<'_, AppState>, preview_id: String) -> Value {
    remove_previewer_preview_db(&state.db, &preview_id);
    serde_json::json!({ "success": true })
}
