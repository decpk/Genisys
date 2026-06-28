use crate::commands::mock_server::state::MockServerState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub async fn cmd_mock_get_running(
    mock_state: State<'_, MockServerState>,
) -> Result<Value, String> {
    let servers = mock_state.servers.lock().await;
    let running: Vec<Value> = servers
        .iter()
        .map(|(id, handle)| {
            json!({
                "server_id": id,
                "port": handle.port,
                "name": handle.server_name,
            })
        })
        .collect();

    Ok(json!({"success": true, "data": running}))
}
