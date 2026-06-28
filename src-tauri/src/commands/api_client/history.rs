use crate::commands::AppState;
use crate::database::{load_api_history_db, load_api_execution_response_db, remove_api_execution_db, clear_api_history_db};
use crate::types::{ApiHistoryEntry, ApiExecutionResponse};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_load_history(state: State<'_, AppState>, workspace_id: String, limit: Option<i64>, offset: Option<i64>) -> Vec<ApiHistoryEntry> {
    load_api_history_db(&state.db, &workspace_id, limit.unwrap_or(50), offset.unwrap_or(0))
}

#[tauri::command]
pub fn cmd_api_load_execution_response(state: State<'_, AppState>, execution_id: String) -> Option<ApiExecutionResponse> {
    load_api_execution_response_db(&state.db, &execution_id)
}

#[tauri::command]
pub fn cmd_api_remove_execution(state: State<'_, AppState>, execution_id: String) -> Value {
    remove_api_execution_db(&state.db, &execution_id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_clear_history(state: State<'_, AppState>, workspace_id: String) -> Value {
    clear_api_history_db(&state.db, &workspace_id);
    serde_json::json!({"success": true})
}
