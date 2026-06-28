use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_delete_project(state: State<'_, AppState>, id: String) -> Value {
    let conn = state.db.conn();

    // Prevent deleting the uncategorized project
    let is_uncategorized: bool = conn
        .query_row(
            "SELECT name FROM mock_projects WHERE id = ?1",
            rusqlite::params![id],
            |row| row.get::<_, String>(0),
        )
        .map(|name| name.to_lowercase() == "uncategorized")
        .unwrap_or(false);

    if is_uncategorized {
        return json!({"success": false, "error": "Cannot delete the uncategorized project"});
    }

    // Find or create the uncategorized project
    let uncategorized_id: String = match conn.query_row(
        "SELECT id FROM mock_projects WHERE LOWER(name) = 'uncategorized'",
        [],
        |row| row.get(0),
    ) {
        Ok(uid) => uid,
        Err(_) => {
            let uid = uuid::Uuid::new_v4().to_string();
            let now = chrono::Utc::now().to_rfc3339();
            let _ = conn.execute(
                "INSERT INTO mock_projects (id, name, color, created_at, updated_at) VALUES (?1, 'uncategorized', '#6b7280', ?2, ?3)",
                rusqlite::params![uid, now, now],
            );
            uid
        }
    };

    // Move servers to uncategorized
    let _ = conn.execute(
        "UPDATE mock_servers SET project_id = ?1 WHERE project_id = ?2",
        rusqlite::params![uncategorized_id, id],
    );

    match conn.execute(
        "DELETE FROM mock_projects WHERE id = ?1",
        rusqlite::params![id],
    ) {
        Ok(_) => json!({"success": true}),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
