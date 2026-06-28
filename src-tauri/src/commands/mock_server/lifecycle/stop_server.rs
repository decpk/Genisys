use crate::commands::mock_server::state::MockServerState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub async fn cmd_mock_stop_server(
    mock_state: State<'_, MockServerState>,
    server_id: String,
) -> Result<Value, String> {
    let mut servers = mock_state.servers.lock().await;
    match servers.remove(&server_id) {
        Some(handle) => {
            if let Some(tx) = handle.shutdown_tx {
                let _ = tx.send(());
            }
            Ok(json!({"success": true}))
        }
        None => Ok(json!({"success": false, "error": "Server is not running"})),
    }
}
