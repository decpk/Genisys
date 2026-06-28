use serde_json::{json, Value};
use tauri::State;

use super::state::RemoteTerminalManager;

/// Report the session id of a tab the desktop Terminal app just created in
/// response to a remote "new tab" request (`remote-terminal-new-tab`). This
/// unblocks the waiting WebSocket `New` handler so it can attach the requesting
/// client to the real, locally-visible tab. An empty `session_id` signals that
/// tab creation failed, so the handler can report the error to the client.
#[tauri::command]
pub async fn cmd_remote_terminal_attach_new(
    manager: State<'_, RemoteTerminalManager>,
    request_id: String,
    session_id: String,
) -> Result<Value, String> {
    let resolved = manager.resolve_pending_new(&request_id, session_id);
    Ok(json!({ "success": resolved }))
}
