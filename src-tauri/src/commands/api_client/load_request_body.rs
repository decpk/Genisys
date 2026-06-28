use crate::commands::AppState;
use crate::database::load_api_request_body_db;
use tauri::State;

#[tauri::command]
pub fn cmd_api_load_request_body(state: State<'_, AppState>, request_id: String) -> Option<String> {
    load_api_request_body_db(&state.db, &request_id)
}
