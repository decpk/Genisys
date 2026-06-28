use crate::commands::AppState;
use crate::database::load_api_request_analytics_db;
use crate::types::ApiAnalyticsPoint;
use tauri::State;

#[tauri::command]
pub fn cmd_api_load_request_analytics(state: State<'_, AppState>, request_id: String, since: String) -> Vec<ApiAnalyticsPoint> {
    load_api_request_analytics_db(&state.db, &request_id, &since)
}
