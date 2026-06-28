use crate::commands::AppState;
use crate::database::move_section_to_notebook_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_move_note_section(state: State<'_, AppState>, section_id: String, new_notebook_id: String) -> Value {
    move_section_to_notebook_db(&state.db, &section_id, &new_notebook_id);
    serde_json::json!({"success": true})
}
