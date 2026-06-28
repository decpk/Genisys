use crate::commands::AppState;
use crate::database::move_topic_to_section_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_move_note_topic(state: State<'_, AppState>, topic_id: String, new_section_id: String) -> Value {
    move_topic_to_section_db(&state.db, &topic_id, &new_section_id);
    serde_json::json!({"success": true})
}
