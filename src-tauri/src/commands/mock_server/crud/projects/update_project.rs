use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_update_project(
    state: State<'_, AppState>,
    id: String,
    name: String,
    color: String,
) -> Value {
    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn();

    match conn.execute(
        "UPDATE mock_projects SET name = ?1, color = ?2, updated_at = ?3 WHERE id = ?4",
        rusqlite::params![name, color, now, id],
    ) {
        Ok(changed) if changed > 0 => json!({"success": true}),
        Ok(_) => json!({"success": false, "error": "Project not found"}),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
