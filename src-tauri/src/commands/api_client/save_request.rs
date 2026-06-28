use crate::commands::AppState;
use crate::database::save_api_request_db;
use crate::types::ApiRequest;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_save_request(state: State<'_, AppState>, request: ApiRequest) -> Result<Value, String> {
    save_api_request_db(&state.db, &request)?;
    Ok(serde_json::json!({"success": true}))
}
