use crate::commands::AppState;
use crate::database::remove_presentation_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_presentation(state: State<'_, AppState>, presentation_id: String) -> Value {
    remove_presentation_db(&state.db, &presentation_id);
    serde_json::json!({"success": true})
}
