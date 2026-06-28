use crate::commands::AppState;
use crate::database::load_commands_db;
use crate::types::ChatCommand;
use tauri::State;

#[tauri::command]
pub fn cmd_load_commands(state: State<'_, AppState>) -> Vec<ChatCommand> {
    let result = load_commands_db(&state.db);
    println!("[db-debug] cmd_load_commands => {} commands", result.len());
    result
}
