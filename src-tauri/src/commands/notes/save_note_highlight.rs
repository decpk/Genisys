use crate::commands::AppState;
use crate::database::save_note_highlight_db;
use crate::types::NoteHighlight;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note_highlight(state: State<'_, AppState>, highlight: NoteHighlight) -> Value {
    save_note_highlight_db(&state.db, &highlight);
    serde_json::json!({"success": true})
}
