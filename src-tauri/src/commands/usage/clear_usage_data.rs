use crate::commands::AppState;
use crate::database::clear_usage_data_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_clear_usage_data(state: State<'_, AppState>) -> Value {
    match clear_usage_data_db(&state.db) {
        Ok(()) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
