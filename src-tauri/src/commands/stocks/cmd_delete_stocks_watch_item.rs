use serde_json::Value;
use tauri::State;

use crate::commands::AppState;
use crate::database::delete_stocks_watch_item_db;

#[tauri::command]
pub fn cmd_delete_stocks_watch_item(state: State<'_, AppState>, item_id: String) -> Value {
    delete_stocks_watch_item_db(&state.db, &item_id);
    serde_json::json!({ "success": true })
}
