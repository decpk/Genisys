use crate::commands::AppState;
use crate::database::{remove_notification_db, remove_all_notifications_db};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_notification(state: State<'_, AppState>, id: String) -> Value {
    remove_notification_db(&state.db, &id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_remove_all_notifications(state: State<'_, AppState>) -> Value {
    remove_all_notifications_db(&state.db);
    serde_json::json!({"success": true})
}
