use crate::commands::AppState;
use crate::database::set_note_labels_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_set_note_labels(state: State<'_, AppState>, note_id: String, label_ids: Vec<String>) -> Value {
    set_note_labels_db(&state.db, &note_id, &label_ids);
    serde_json::json!({"success": true})
}
