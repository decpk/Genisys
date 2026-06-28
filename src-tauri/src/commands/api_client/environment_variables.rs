use crate::commands::AppState;
use crate::database::{load_environment_variables_db, save_api_environment_variable_db, remove_api_environment_variable_db};
use crate::types::ApiEnvironmentVariable;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_load_environment_variables(state: State<'_, AppState>, environment_id: String) -> Vec<ApiEnvironmentVariable> {
    load_environment_variables_db(&state.db, &environment_id)
}

#[tauri::command]
pub fn cmd_api_save_environment_variable(state: State<'_, AppState>, variable: ApiEnvironmentVariable) -> Value {
    save_api_environment_variable_db(&state.db, &variable);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_remove_environment_variable(state: State<'_, AppState>, variable_id: String) -> Value {
    remove_api_environment_variable_db(&state.db, &variable_id);
    serde_json::json!({"success": true})
}
