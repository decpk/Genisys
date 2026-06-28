use crate::commands::AppState;
use crate::database::remove_dp_review_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_remove_review(state: State<'_, AppState>, id: String) -> Value {
    remove_dp_review_db(&state.db, &id);
    serde_json::json!({"success": true})
}
