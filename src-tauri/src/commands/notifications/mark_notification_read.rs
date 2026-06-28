use crate::commands::AppState;
use crate::database::{mark_notification_read_db, mark_all_notifications_read_db};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_mark_notification_read(state: State<'_, AppState>, id: String) -> Value {
    mark_notification_read_db(&state.db, &id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_mark_all_notifications_read(state: State<'_, AppState>) -> Value {
    mark_all_notifications_read_db(&state.db);
    serde_json::json!({"success": true})
}
