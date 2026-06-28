use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_trash_note(state: State<'_, AppState>, note_id: String) -> Value {
    crate::database::trash_note_db(&state.db, &note_id);
    serde_json::json!({"success": true})
}
