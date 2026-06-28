use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_load_projects(state: State<'_, AppState>) -> Value {
    let conn = state.db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, color, created_at, updated_at FROM mock_projects ORDER BY created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => return json!({"success": false, "error": e.to_string()}),
    };

    let rows: Vec<Value> = match stmt.query_map([], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "name": row.get::<_, String>(1)?,
            "color": row.get::<_, String>(2)?,
            "created_at": row.get::<_, String>(3)?,
            "updated_at": row.get::<_, String>(4)?,
        }))
    }) {
        Ok(mapped) => mapped.filter_map(|r| r.ok()).collect(),
        Err(_) => vec![],
    };

    json!({ "success": true, "data": rows })
}
