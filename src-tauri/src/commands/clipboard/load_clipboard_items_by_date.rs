use crate::commands::AppState;
use crate::database::load_clipboard_items_by_date_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_clipboard_items_by_date(
    state: State<'_, AppState>,
    date: String,
) -> Value {
    let items = load_clipboard_items_by_date_db(&state.db, &date);
    serde_json::json!({ "items": items })
}
