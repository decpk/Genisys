use crate::commands::AppState;
use crate::database::load_prompts_db;
use crate::types::Prompt;
use tauri::State;

#[tauri::command]
pub fn cmd_load_prompts(state: State<'_, AppState>) -> Vec<Prompt> {
    let result = load_prompts_db(&state.db);
    println!("[db-debug] cmd_load_prompts => {} prompts", result.len());
    result
}
