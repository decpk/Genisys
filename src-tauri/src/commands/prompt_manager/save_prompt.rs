use crate::commands::AppState;
use crate::database::save_pm_prompt_db;
use crate::types::PmPrompt;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_save_prompt(state: State<'_, AppState>, prompt: PmPrompt) -> Value {
    save_pm_prompt_db(&state.db, &prompt);
    serde_json::json!({"success": true})
}
