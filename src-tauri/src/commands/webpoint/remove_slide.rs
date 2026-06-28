use crate::commands::AppState;
use crate::database::remove_slide_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_slide(state: State<'_, AppState>, slide_id: String) -> Value {
    remove_slide_db(&state.db, &slide_id);
    serde_json::json!({"success": true})
}
