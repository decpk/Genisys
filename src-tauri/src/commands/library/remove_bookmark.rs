use crate::commands::AppState;
use crate::database::remove_bookmark_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_bookmark(state: State<'_, AppState>, bookmark_id: String) -> Value {
    remove_bookmark_db(&state.db, &bookmark_id);
    serde_json::json!({"success": true})
}
