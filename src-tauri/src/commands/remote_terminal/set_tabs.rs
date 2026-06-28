use serde_json::{json, Value};
use tauri::State;

use super::state::RemoteTerminalManager;
use super::types::RemoteTabInfo;

/// Replace the set of terminal tabs advertised to remote clients. Pushed by the
/// desktop Terminal app whenever its tabs change (open / close / cd / rename /
/// reorder) so a LAN browser mirrors exactly the app's open tabs — with their
/// titles — and nothing else (the dock terminal and orphaned PTYs stay private).
#[tauri::command]
pub async fn cmd_remote_terminal_set_tabs(
    manager: State<'_, RemoteTerminalManager>,
    tabs: Vec<RemoteTabInfo>,
) -> Result<Value, String> {
    manager.set_tabs(tabs);
    Ok(json!({ "success": true }))
}
