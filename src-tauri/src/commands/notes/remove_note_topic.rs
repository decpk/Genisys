use crate::commands::AppState;
use crate::database::remove_note_topic_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_topic(state: State<'_, AppState>, topic_id: String) -> Value {
    remove_note_topic_db(&state.db, &topic_id);
    serde_json::json!({"success": true})
}
