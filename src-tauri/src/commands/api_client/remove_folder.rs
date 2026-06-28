use crate::commands::AppState;
use crate::database::remove_api_folder_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_remove_folder(state: State<'_, AppState>, folder_id: String) -> Value {
    remove_api_folder_db(&state.db, &folder_id);
    serde_json::json!({"success": true})
}
