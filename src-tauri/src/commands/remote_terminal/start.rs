use serde_json::{json, Value};
use tauri::{AppHandle, Manager, State};

use crate::commands::terminal::TerminalManager;

use super::server::start_server;
use super::state::RemoteTerminalManager;

/// Start sharing the terminal over the LAN. Returns the QR URL (with embedded
/// token), the LAN IP, the bound port, and the access token.
#[tauri::command]
pub async fn cmd_remote_terminal_start(
    app: AppHandle,
    manager: State<'_, RemoteTerminalManager>,
    port: Option<u16>,
) -> Result<Value, String> {
    // Grab the shared PTY manager before `app` is moved into `start_server` so
    // we can turn on scrollback retention once sharing is live.
    let term = app.state::<TerminalManager>().inner().clone();
    match start_server(app, manager.inner().clone(), port).await {
        Ok(info) => {
            // Sharing is up: start retaining per-session scrollback so a remote
            // mirror can replay history when it attaches.
            term.set_history_capture(true);
            Ok(json!({ "success": true, "data": info }))
        }
        Err(error) => Ok(json!({ "success": false, "error": error })),
    }
}
