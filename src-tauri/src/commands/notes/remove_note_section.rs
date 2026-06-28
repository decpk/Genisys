use crate::commands::AppState;
use crate::database::remove_note_section_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_section(state: State<'_, AppState>, section_id: String) -> Value {
    remove_note_section_db(&state.db, &section_id);
    serde_json::json!({"success": true})
}
