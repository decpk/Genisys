use crate::commands::AppState;
use crate::database::clear_all_previewer_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_previewer_clear_all(state: State<'_, AppState>) -> Value {
    clear_all_previewer_db(&state.db);
    serde_json::json!({ "success": true })
}
