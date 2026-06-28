use crate::commands::AppState;
use crate::database::remove_timer_session_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_timer_session(state: State<'_, AppState>, id: String) -> Value {
    match remove_timer_session_db(&state.db, &id) {
        Ok(_) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
