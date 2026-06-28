use crate::commands::AppState;
use crate::database::remove_note_highlights_in_range_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_note_highlights_in_range(
    state: State<'_, AppState>,
    note_id: String,
    from_pos: i64,
    to_pos: i64,
) -> Value {
    remove_note_highlights_in_range_db(&state.db, &note_id, from_pos, to_pos);
    serde_json::json!({"success": true})
}
