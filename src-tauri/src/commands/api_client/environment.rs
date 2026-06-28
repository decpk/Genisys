use crate::commands::AppState;
use crate::database::{save_api_environment_db, set_active_environment_db, remove_api_environment_db};
use crate::types::ApiEnvironment;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_save_environment(state: State<'_, AppState>, environment: ApiEnvironment) -> Value {
    save_api_environment_db(&state.db, &environment);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_set_active_environment(state: State<'_, AppState>, workspace_id: String, environment_id: String) -> Value {
    set_active_environment_db(&state.db, &workspace_id, &environment_id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_remove_environment(state: State<'_, AppState>, environment_id: String) -> Value {
    remove_api_environment_db(&state.db, &environment_id);
    serde_json::json!({"success": true})
}
