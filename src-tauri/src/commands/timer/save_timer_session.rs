use crate::commands::AppState;
use crate::database::save_timer_session_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_timer_session(state: State<'_, AppState>, session: Value) -> Value {
    match save_timer_session_db(&state.db, &session) {
        Ok(id) => serde_json::json!({ "success": true, "id": id }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
