use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_update_server(
    state: State<'_, AppState>,
    id: String,
    name: String,
    port: u16,
    project_id: String,
) -> Value {
    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn();

    match conn.execute(
        "UPDATE mock_servers SET name = ?1, port = ?2, project_id = ?3, updated_at = ?4 WHERE id = ?5",
        rusqlite::params![name, port as i64, project_id, now, id],
    ) {
        Ok(changed) if changed > 0 => json!({"success": true}),
        Ok(_) => json!({"success": false, "error": "Server not found"}),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
