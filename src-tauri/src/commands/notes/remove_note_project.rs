use crate::commands::AppState;
use crate::database::remove_note_project_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_project(state: State<'_, AppState>, project_id: String) -> Value {
    remove_note_project_db(&state.db, &project_id);
    serde_json::json!({"success": true})
}
