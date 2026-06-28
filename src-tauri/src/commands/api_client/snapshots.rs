use crate::commands::AppState;
use crate::database::{save_api_response_snapshot_db, load_api_response_snapshots_db, remove_api_response_snapshot_db, save_api_saved_example_db, load_api_saved_examples_db, remove_api_saved_example_db};
use crate::types::{ApiResponseSnapshot, ApiSavedExample};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_save_response_snapshot(state: State<'_, AppState>, snapshot: ApiResponseSnapshot) -> Value {
    save_api_response_snapshot_db(&state.db, &snapshot);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_load_response_snapshots(state: State<'_, AppState>, request_id: String) -> Vec<ApiResponseSnapshot> {
    load_api_response_snapshots_db(&state.db, &request_id)
}

#[tauri::command]
pub fn cmd_api_remove_response_snapshot(state: State<'_, AppState>, snapshot_id: String) -> Value {
    remove_api_response_snapshot_db(&state.db, &snapshot_id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_save_example(state: State<'_, AppState>, example: ApiSavedExample) -> Value {
    save_api_saved_example_db(&state.db, &example);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_load_examples(state: State<'_, AppState>, request_id: String) -> Vec<ApiSavedExample> {
    load_api_saved_examples_db(&state.db, &request_id)
}

#[tauri::command]
pub fn cmd_api_remove_example(state: State<'_, AppState>, example_id: String) -> Value {
    remove_api_saved_example_db(&state.db, &example_id);
    serde_json::json!({"success": true})
}
