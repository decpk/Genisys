use crate::commands::AppState;
use crate::database::load_api_client_data_db;
use crate::types::ApiClientData;
use tauri::State;

#[tauri::command]
pub fn cmd_api_load_all(state: State<'_, AppState>) -> ApiClientData {
    load_api_client_data_db(&state.db)
}
