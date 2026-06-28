use crate::commands::AppState;
use crate::database::save_api_collection_db;
use crate::types::ApiCollection;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_save_collection(state: State<'_, AppState>, collection: ApiCollection) -> Result<Value, String> {
    save_api_collection_db(&state.db, &collection)?;
    Ok(serde_json::json!({"success": true}))
}
