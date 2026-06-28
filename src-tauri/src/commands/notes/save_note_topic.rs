use crate::commands::AppState;
use crate::database::save_note_topic_db;
use crate::types::NoteTopic;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note_topic(state: State<'_, AppState>, topic: NoteTopic) -> Value {
    save_note_topic_db(&state.db, &topic);
    serde_json::json!({"success": true})
}
