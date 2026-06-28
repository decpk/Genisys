use crate::commands::AppState;
use crate::database::save_note_db;
use crate::types::Note;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note(state: State<'_, AppState>, note: Note) -> Value {
    save_note_db(&state.db, &note);
    serde_json::json!({"success": true})
}
