use crate::commands::AppState;
use crate::database::load_notifications_db;
use crate::types::*;
use tauri::State;

#[tauri::command]
pub fn cmd_load_notifications(
    state: State<'_, AppState>,
    before_cursor: Option<String>,
    page_size: Option<i64>,
    filters: Option<NotificationFilters>,
) -> NotificationPage {
    load_notifications_db(
        &state.db,
        before_cursor.as_deref(),
        page_size,
        filters.as_ref(),
    )
}
