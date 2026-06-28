use crate::commands::AppState;
use crate::database::*;
use crate::types::*;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_meeting(state: State<'_, AppState>, meeting: DPMeeting) -> Value {
    save_dp_meeting_db(&state.db, &meeting);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_load_meetings(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Vec<DPMeeting> {
    load_dp_meetings_db(&state.db, &start_date, &end_date)
}

#[tauri::command]
pub fn cmd_dp_remove_meeting(state: State<'_, AppState>, id: String) -> Value {
    remove_dp_meeting_db(&state.db, &id);
    serde_json::json!({"success": true})
}
