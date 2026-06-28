use crate::commands::AppState;
use crate::database::remove_note_label_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_label(state: State<'_, AppState>, label_id: String) -> Value {
    remove_note_label_db(&state.db, &label_id);
    serde_json::json!({"success": true})
}
