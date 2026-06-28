use crate::commands::AppState;
use crate::database::load_note_notebooks_db;
use crate::types::NoteNotebook;
use tauri::State;

#[tauri::command]
pub fn cmd_load_note_notebooks(state: State<'_, AppState>) -> Vec<NoteNotebook> {
    load_note_notebooks_db(&state.db)
}
