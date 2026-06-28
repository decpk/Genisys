use crate::commands::AppState;
use crate::database::load_note_labels_db;
use crate::types::NoteLabel;
use tauri::State;

#[tauri::command]
pub fn cmd_load_note_labels(state: State<'_, AppState>) -> Vec<NoteLabel> {
    load_note_labels_db(&state.db)
}
