use crate::commands::AppState;
use crate::database::remove_note_highlight_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_highlight(state: State<'_, AppState>, highlight_id: String) -> Value {
    remove_note_highlight_db(&state.db, &highlight_id);
    serde_json::json!({"success": true})
}
