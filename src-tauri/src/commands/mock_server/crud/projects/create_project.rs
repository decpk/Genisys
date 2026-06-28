use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_create_project(state: State<'_, AppState>, name: String, color: String) -> Value {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn();

    match conn.execute(
        "INSERT INTO mock_projects (id, name, color, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, name, color, now, now],
    ) {
        Ok(_) => json!({
            "success": true,
            "data": {
                "id": id,
                "name": name,
                "color": color,
                "created_at": now,
                "updated_at": now,
            }
        }),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
