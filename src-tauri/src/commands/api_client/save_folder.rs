use crate::commands::AppState;
use crate::database::save_api_folder_db;
use crate::types::ApiFolder;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_save_folder(state: State<'_, AppState>, folder: ApiFolder) -> Result<Value, String> {
    save_api_folder_db(&state.db, &folder)?;
    Ok(serde_json::json!({"success": true}))
}
