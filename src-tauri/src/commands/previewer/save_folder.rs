use crate::commands::AppState;
use crate::database::save_previewer_folder_db;
use crate::types::PreviewFolder;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_previewer_save_folder(state: State<'_, AppState>, folder: PreviewFolder) -> Value {
    save_previewer_folder_db(&state.db, &folder);
    serde_json::json!({ "success": true })
}
