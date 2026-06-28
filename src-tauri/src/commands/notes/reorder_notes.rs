use crate::commands::AppState;
use crate::database::reorder_notes_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_reorder_notes(state: State<'_, AppState>, ordered_ids: Vec<String>) -> Value {
    reorder_notes_db(&state.db, &ordered_ids);
    serde_json::json!({"success": true})
}
