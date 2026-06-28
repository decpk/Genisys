use crate::commands::AppState;
use crate::database::save_timer_milestone_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_timer_milestone(state: State<'_, AppState>, key: String) -> Value {
    match save_timer_milestone_db(&state.db, &key) {
        Ok(id) => serde_json::json!({ "success": true, "id": id }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
