use crate::commands::AppState;
use crate::database::load_note_highlights_db;
use crate::types::NoteHighlight;
use tauri::State;

#[tauri::command]
pub fn cmd_load_note_highlights(state: State<'_, AppState>, note_id: String) -> Vec<NoteHighlight> {
    load_note_highlights_db(&state.db, &note_id)
}
