use crate::commands::mock_server::state::MockServerState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub async fn cmd_mock_stop_all_servers(
    mock_state: State<'_, MockServerState>,
) -> Result<Value, String> {
    let mut servers = mock_state.servers.lock().await;
    let count = servers.len();

    for (_id, handle) in servers.drain() {
        if let Some(tx) = handle.shutdown_tx {
            let _ = tx.send(());
        }
    }

    Ok(json!({"success": true, "count": count}))
}
