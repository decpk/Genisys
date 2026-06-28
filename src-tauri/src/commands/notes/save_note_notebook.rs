use crate::commands::AppState;
use crate::database::save_note_notebook_db;
use crate::types::NoteNotebook;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_note_notebook(state: State<'_, AppState>, notebook: NoteNotebook) -> Value {
    save_note_notebook_db(&state.db, &notebook);
    serde_json::json!({"success": true})
}
