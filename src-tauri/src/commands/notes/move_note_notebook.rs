use crate::commands::AppState;
use crate::database::move_notebook_to_project_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_move_note_notebook(
    state: State<'_, AppState>,
    notebook_id: String,
    new_project_id: Option<String>,
) -> Value {
    move_notebook_to_project_db(&state.db, &notebook_id, new_project_id.as_deref());
    serde_json::json!({"success": true})
}
