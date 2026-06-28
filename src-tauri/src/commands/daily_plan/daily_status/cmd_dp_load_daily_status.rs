use crate::commands::AppState;
use crate::database::load_dp_daily_status_db;
use crate::types::DPDailyStatus;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_load_daily_status(
    state: State<'_, AppState>,
    date: String,
) -> Option<DPDailyStatus> {
    load_dp_daily_status_db(&state.db, &date)
}
