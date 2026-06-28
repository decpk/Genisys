use crate::commands::AppState;
use crate::database::remove_api_collection_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_remove_collection(state: State<'_, AppState>, collection_id: String) -> Value {
    remove_api_collection_db(&state.db, &collection_id);
    serde_json::json!({"success": true})
}
