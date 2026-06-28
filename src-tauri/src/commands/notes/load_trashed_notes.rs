use crate::commands::AppState;
use crate::database::load_trashed_notes_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_trashed_notes(state: State<'_, AppState>) -> Value {
    let notes = load_trashed_notes_db(&state.db);
    serde_json::to_value(notes).unwrap_or(serde_json::json!([]))
}
