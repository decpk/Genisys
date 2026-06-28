use crate::commands::AppState;
use crate::database::save_pm_folder_db;
use crate::types::PmFolder;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_save_folder(state: State<'_, AppState>, folder: PmFolder) -> Value {
    save_pm_folder_db(&state.db, &folder);
    serde_json::json!({"success": true})
}
