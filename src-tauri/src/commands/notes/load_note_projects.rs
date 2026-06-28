use crate::commands::AppState;
use crate::database::load_note_projects_db;
use crate::types::NoteProject;
use tauri::State;

#[tauri::command]
pub fn cmd_load_note_projects(state: State<'_, AppState>) -> Vec<NoteProject> {
    load_note_projects_db(&state.db)
}
