use crate::commands::AppState;
use crate::database::remove_ai_session_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_ai_session(state: State<'_, AppState>, session_id: String) -> Value {
    remove_ai_session_db(&state.db, &session_id);
    serde_json::json!({"success": true})
}
