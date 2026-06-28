use serde_json::{json, Value};
use tauri::State;

use super::state::TerminalManager;

#[tauri::command]
pub async fn cmd_terminal_resize(
    manager: State<'_, TerminalManager>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<Value, String> {
    manager.resize(&id, cols, rows)?;
    Ok(json!({ "success": true }))
}
