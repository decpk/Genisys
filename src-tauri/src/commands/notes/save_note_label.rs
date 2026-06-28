use crate::commands::AppState;
use crate::database::save_note_label_db;
use crate::types::NoteLabel;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note_label(state: State<'_, AppState>, label: NoteLabel) -> Value {
    save_note_label_db(&state.db, &label);
    serde_json::json!({"success": true})
}
