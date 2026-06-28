use crate::commands::AppState;
use crate::database::save_bookmark_db;
use crate::types::Bookmark;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_bookmark(state: State<'_, AppState>, bookmark: Bookmark) -> Value {
    save_bookmark_db(&state.db, &bookmark);
    serde_json::json!({"success": true})
}
