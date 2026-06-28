use crate::commands::AppState;
use crate::database::save_note_project_db;
use crate::types::NoteProject;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note_project(state: State<'_, AppState>, project: NoteProject) -> Value {
    save_note_project_db(&state.db, &project);
    serde_json::json!({"success": true})
}
