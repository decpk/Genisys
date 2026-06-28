use crate::commands::AppState;
use crate::database::save_dp_daily_status_db;
use crate::types::DPDailyStatus;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_daily_status(state: State<'_, AppState>, status: DPDailyStatus) -> Value {
    save_dp_daily_status_db(&state.db, &status);
    serde_json::json!({"success": true})
}
