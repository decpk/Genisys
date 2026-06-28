use crate::commands::mock_server::state::MockServerState;
use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub async fn cmd_mock_delete_server(
    state: State<'_, AppState>,
    mock_state: State<'_, MockServerState>,
    id: String,
) -> Result<Value, String> {
    // Stop the server if running
    {
        let mut servers = mock_state.servers.lock().await;
        if let Some(handle) = servers.remove(&id) {
            if let Some(tx) = handle.shutdown_tx {
                let _ = tx.send(());
            }
        }
    }

    let mut conn = state.db.conn();

    let tx = match conn.transaction() {
        Ok(tx) => tx,
        Err(e) => return Ok(json!({"success": false, "error": e.to_string()})),
    };

    // Delete in dependency order so foreign-key constraints don't block the
    // server delete. Variants reference endpoints, endpoints reference the
    // server; request logs have no FK but are cleaned up here too.
    let result = (|| {
        tx.execute(
            "DELETE FROM mock_endpoint_variants WHERE endpoint_id IN \
             (SELECT id FROM mock_endpoints WHERE server_id = ?1)",
            rusqlite::params![id],
        )?;
        tx.execute(
            "DELETE FROM mock_request_logs WHERE server_id = ?1",
            rusqlite::params![id],
        )?;
        tx.execute(
            "DELETE FROM mock_endpoints WHERE server_id = ?1",
            rusqlite::params![id],
        )?;
        tx.execute(
            "DELETE FROM mock_servers WHERE id = ?1",
            rusqlite::params![id],
        )?;
        Ok::<(), rusqlite::Error>(())
    })();

    match result {
        Ok(()) => match tx.commit() {
            Ok(()) => Ok(json!({"success": true})),
            Err(e) => Ok(json!({"success": false, "error": e.to_string()})),
        },
        Err(e) => {
            let _ = tx.rollback();
            Ok(json!({"success": false, "error": e.to_string()}))
        }
    }
}
