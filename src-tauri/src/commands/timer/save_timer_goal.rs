use crate::commands::AppState;
use crate::database::save_timer_goal_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_timer_goal(state: State<'_, AppState>, goal: Value) -> Value {
    match save_timer_goal_db(&state.db, &goal) {
        Ok(id) => serde_json::json!({ "success": true, "id": id }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
