use crate::commands::AppState;
use crate::database::save_notification_db;
use crate::types::NotificationRecord;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_notification(state: State<'_, AppState>, notification: NotificationRecord) -> Value {
    save_notification_db(&state.db, &notification);
    serde_json::json!({"success": true})
}
