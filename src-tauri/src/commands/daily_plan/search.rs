use crate::commands::AppState;
use crate::database::*;
use crate::types::*;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_search_tasks(state: State<'_, AppState>, query: String) -> Vec<DPTask> {
    search_dp_tasks_db(&state.db, &query)
}

#[tauri::command]
pub fn cmd_dp_search_meetings(state: State<'_, AppState>, query: String) -> Vec<DPMeeting> {
    search_dp_meetings_db(&state.db, &query)
}
