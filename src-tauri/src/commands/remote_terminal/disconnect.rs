use serde_json::{json, Value};
use tauri::State;

use super::state::RemoteTerminalManager;

/// Forcibly disconnect a connected remote client by id. Its bridge tasks stop
/// and the socket closes; a dedicated session is killed as part of teardown.
#[tauri::command]
pub async fn cmd_remote_terminal_disconnect(
    manager: State<'_, RemoteTerminalManager>,
    client_id: String,
) -> Result<Value, String> {
    match manager.client_close(&client_id) {
        Some(close) => {
            let _ = close.send(true);
            Ok(json!({ "success": true }))
        }
        None => Ok(json!({ "success": false, "error": "client not found" })),
    }
}
