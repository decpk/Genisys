use crate::commands::AppState;
use crate::database::load_labels_for_clipboard_item_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_labels_for_clipboard_item(
    state: State<'_, AppState>,
    item_id: String,
) -> Value {
    let labels = load_labels_for_clipboard_item_db(&state.db, &item_id);
    serde_json::json!({ "labels": labels })
}
