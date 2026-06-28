use serde_json::{json, Value};
use tauri::{AppHandle, Manager, State};

use crate::commands::terminal::TerminalManager;

use super::server::stop_server;
use super::state::RemoteTerminalManager;

/// Stop sharing: disconnect all clients and shut the server down. No-op when
/// not running.
#[tauri::command]
pub async fn cmd_remote_terminal_stop(
    app: AppHandle,
    manager: State<'_, RemoteTerminalManager>,
) -> Result<Value, String> {
    stop_server(manager.inner().clone()).await;
    // Sharing is off: stop retaining scrollback and drop what we held so the
    // buffers don't linger after the last device disconnects.
    app.state::<TerminalManager>().set_history_capture(false);
    Ok(json!({ "success": true }))
}
