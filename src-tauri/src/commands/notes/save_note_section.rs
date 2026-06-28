use crate::commands::AppState;
use crate::database::save_note_section_db;
use crate::types::NoteSection;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note_section(state: State<'_, AppState>, section: NoteSection) -> Value {
    save_note_section_db(&state.db, &section);
    serde_json::json!({"success": true})
}
