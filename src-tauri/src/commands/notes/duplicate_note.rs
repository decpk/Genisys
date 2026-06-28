use crate::commands::AppState;
use crate::database::duplicate_note_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_duplicate_note(state: State<'_, AppState>, note_id: String) -> Value {
    match duplicate_note_db(&state.db, &note_id) {
        Some(note) => serde_json::to_value(note).unwrap_or(serde_json::json!(null)),
        None => serde_json::json!(null),
    }
}
