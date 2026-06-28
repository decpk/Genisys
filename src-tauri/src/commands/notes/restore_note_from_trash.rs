use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_restore_note_from_trash(state: State<'_, AppState>, note_id: String) -> Value {
    crate::database::restore_note_from_trash_db(&state.db, &note_id);
    serde_json::json!({"success": true})
}
