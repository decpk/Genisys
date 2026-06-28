use serde_json::{json, Value};
use tauri::State;

use super::state::TerminalManager;

#[tauri::command]
pub async fn cmd_terminal_list(manager: State<'_, TerminalManager>) -> Result<Value, String> {
    Ok(json!({ "success": true, "data": manager.list() }))
}
