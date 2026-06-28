use crate::commands::AppState;
use crate::database::load_all_notes_db;
use crate::types::Note;
use tauri::State;

#[tauri::command]
pub fn cmd_load_all_notes(state: State<'_, AppState>) -> Vec<Note> {
    load_all_notes_db(&state.db)
}
