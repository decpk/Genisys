use crate::commands::AppState;
use crate::database::*;
use crate::types::*;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_daily_entry(state: State<'_, AppState>, entry: DPDailyEntry) -> Value {
    save_dp_daily_entry_db(&state.db, &entry);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_load_daily_entry(
    state: State<'_, AppState>,
    date: String,
) -> Option<DPDailyEntry> {
    load_dp_daily_entry_db(&state.db, &date)
}

#[tauri::command]
pub fn cmd_dp_load_daily_entries_range(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Vec<DPDailyEntry> {
    load_dp_daily_entries_range_db(&state.db, &start_date, &end_date)
}
