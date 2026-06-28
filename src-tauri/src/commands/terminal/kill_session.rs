use serde_json::{json, Value};
use tauri::State;

use super::state::TerminalManager;

#[tauri::command]
pub async fn cmd_terminal_kill(
    manager: State<'_, TerminalManager>,
    id: String,
) -> Result<Value, String> {
    manager.kill(&id)?;
    Ok(json!({ "success": true }))
}
