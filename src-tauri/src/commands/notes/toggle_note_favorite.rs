use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_toggle_note_favorite(state: State<'_, AppState>, note_id: String) -> Value {
    crate::database::toggle_note_favorite_db(&state.db, &note_id);
    serde_json::json!({"success": true})
}
