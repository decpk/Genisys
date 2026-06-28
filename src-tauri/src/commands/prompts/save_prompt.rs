use crate::commands::AppState;
use crate::database::save_prompt_db;
use crate::types::Prompt;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_prompt(state: State<'_, AppState>, prompt: Prompt) -> Value {
    save_prompt_db(&state.db, &prompt);
    serde_json::json!({"success": true})
}
