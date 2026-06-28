use crate::commands::AppState;
use crate::database::save_snippet_db;
use crate::types::Snippet;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_snippet(state: State<'_, AppState>, snippet: Snippet) -> Value {
    save_snippet_db(&state.db, &snippet);
    serde_json::json!({"success": true})
}
