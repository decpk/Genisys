use base64::Engine;
use serde_json::{json, Value};
use tauri::State;

use super::state::TerminalManager;

#[tauri::command]
pub async fn cmd_terminal_write(
    manager: State<'_, TerminalManager>,
    id: String,
    data: String,
) -> Result<Value, String> {
    // `data` is base64-encoded raw bytes (so we can transport binary safely).
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(data.as_bytes())
        .map_err(|e| format!("base64 decode failed: {e}"))?;
    manager.write(&id, &bytes)?;
    Ok(json!({ "success": true }))
}
