use crate::commands::AppState;
use crate::database::add_label_to_clipboard_item_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_add_label_to_clipboard_item(
    state: State<'_, AppState>,
    item_id: String,
    label_id: String,
) -> Value {
    let success = add_label_to_clipboard_item_db(&state.db, &item_id, &label_id);
    serde_json::json!({ "success": success })
}
