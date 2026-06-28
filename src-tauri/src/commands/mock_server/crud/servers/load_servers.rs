use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_load_servers(state: State<'_, AppState>) -> Value {
    let conn = state.db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, project_id, name, port, created_at, updated_at FROM mock_servers ORDER BY created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => return json!({"success": false, "error": e.to_string()}),
    };

    let rows: Vec<Value> = match stmt.query_map([], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "project_id": row.get::<_, String>(1)?,
            "name": row.get::<_, String>(2)?,
            "port": row.get::<_, i64>(3)?,
            "created_at": row.get::<_, String>(4)?,
            "updated_at": row.get::<_, String>(5)?,
        }))
    }) {
        Ok(mapped) => mapped.filter_map(|r| r.ok()).collect(),
        Err(_) => vec![],
    };

    json!({ "success": true, "data": rows })
}
