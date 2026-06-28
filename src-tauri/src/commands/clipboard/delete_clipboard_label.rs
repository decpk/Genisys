use crate::commands::AppState;
use crate::database::{count_items_with_label_db, delete_clipboard_label_db};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_delete_clipboard_label(
    state: State<'_, AppState>,
    id: String,
) -> Value {
    let affected_count = count_items_with_label_db(&state.db, &id);
    let success = delete_clipboard_label_db(&state.db, &id);
    serde_json::json!({ "success": success, "affectedCount": affected_count })
}
