use crate::commands::AppState;
use crate::database::remove_note_notebook_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_notebook(state: State<'_, AppState>, notebook_id: String) -> Value {
    remove_note_notebook_db(&state.db, &notebook_id);
    serde_json::json!({"success": true})
}
