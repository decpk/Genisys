use crate::commands::AppState;
use crate::database::remove_api_request_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_remove_request(state: State<'_, AppState>, request_id: String) -> Value {
    remove_api_request_db(&state.db, &request_id);
    serde_json::json!({"success": true})
}
