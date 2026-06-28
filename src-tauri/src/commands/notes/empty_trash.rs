use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_empty_trash(state: State<'_, AppState>) -> Value {
    crate::database::empty_trash_db(&state.db);
    serde_json::json!({"success": true})
}
