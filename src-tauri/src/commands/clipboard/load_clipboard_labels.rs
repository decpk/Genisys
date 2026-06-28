use crate::commands::AppState;
use crate::database::load_clipboard_labels_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_clipboard_labels(
    state: State<'_, AppState>,
) -> Value {
    let labels = load_clipboard_labels_db(&state.db);
    serde_json::json!({ "labels": labels })
}
