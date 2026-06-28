use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_create_server(
    state: State<'_, AppState>,
    project_id: String,
    name: String,
    port: u16,
) -> Value {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn();

    match conn.execute(
        "INSERT INTO mock_servers (id, project_id, name, port, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, project_id, name, port as i64, now, now],
    ) {
        Ok(_) => json!({
            "success": true,
            "data": {
                "id": id,
                "project_id": project_id,
                "name": name,
                "port": port,
                "created_at": now,
                "updated_at": now,
            }
        }),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
