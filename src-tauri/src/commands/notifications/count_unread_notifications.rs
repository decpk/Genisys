use crate::commands::AppState;
use crate::database::count_unread_notifications_db;
use tauri::State;

#[tauri::command]
pub fn cmd_count_unread_notifications(state: State<'_, AppState>) -> i64 {
    count_unread_notifications_db(&state.db)
}
