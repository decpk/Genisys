use crate::commands::AppState;
use crate::database::remove_pm_folder_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_remove_folder(state: State<'_, AppState>, folder_id: String) -> Value {
    remove_pm_folder_db(&state.db, &folder_id);
    serde_json::json!({"success": true})
}
