use crate::commands::AppState;
use crate::database::save_command_db;
use crate::types::ChatCommand;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_command(state: State<'_, AppState>, command: ChatCommand) -> Value {
    if command.is_built_in {
        return serde_json::json!({"success": false, "error": "Cannot modify built-in commands"});
    }
    save_command_db(&state.db, &command);
    serde_json::json!({"success": true})
}
