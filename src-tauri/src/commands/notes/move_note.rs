use crate::commands::AppState;
use crate::database::move_note_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_move_note(
    state: State<'_, AppState>,
    note_id: String,
    notebook_id: Option<String>,
    section_id: Option<String>,
    topic_id: Option<String>,
) -> Value {
    move_note_db(
        &state.db,
        &note_id,
        notebook_id.as_deref(),
        section_id.as_deref(),
        topic_id.as_deref(),
    );
    serde_json::json!({"success": true})
}
