use crate::commands::AppState;
use crate::database::load_pm_data_db;
use crate::types::PmFullData;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_load_all(state: State<'_, AppState>) -> PmFullData {
    load_pm_data_db(&state.db)
}
