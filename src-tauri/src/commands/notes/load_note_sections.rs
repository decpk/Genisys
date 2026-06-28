use crate::commands::AppState;
use crate::database::load_note_sections_db;
use crate::types::NoteSection;
use tauri::State;

#[tauri::command]
pub fn cmd_load_note_sections(state: State<'_, AppState>, notebook_id: Option<String>) -> Vec<NoteSection> {
    load_note_sections_db(&state.db, notebook_id.as_deref())
}
