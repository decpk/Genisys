use crate::commands::AppState;
use crate::database::remove_note_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note(state: State<'_, AppState>, note_id: String) -> Value {
    remove_note_db(&state.db, &note_id);
    serde_json::json!({"success": true})
}
