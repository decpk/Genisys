use crate::commands::AppState;
use crate::database::remove_pm_prompt_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_remove_prompt(state: State<'_, AppState>, prompt_id: String) -> Value {
    remove_pm_prompt_db(&state.db, &prompt_id);
    serde_json::json!({"success": true})
}
