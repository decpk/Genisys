use crate::commands::AppState;
use crate::database::update_clipboard_label_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_update_clipboard_label(
    state: State<'_, AppState>,
    id: String,
    name: String,
    color: String,
) -> Value {
    let success = update_clipboard_label_db(&state.db, &id, &name, &color);
    serde_json::json!({ "success": success })
}
