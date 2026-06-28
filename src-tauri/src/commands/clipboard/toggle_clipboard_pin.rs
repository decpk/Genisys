use crate::commands::AppState;
use crate::database::toggle_clipboard_pin_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_toggle_clipboard_pin(
    state: State<'_, AppState>,
    id: String,
) -> Value {
    let is_pinned = toggle_clipboard_pin_db(&state.db, &id);
    serde_json::json!({ "success": true, "isPinned": is_pinned })
}
