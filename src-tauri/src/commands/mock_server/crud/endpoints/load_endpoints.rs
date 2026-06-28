use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_load_endpoints(state: State<'_, AppState>, server_id: String) -> Value {
    let conn = state.db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, server_id, method, path, status_code, response_headers, response_body, \
         response_type, ai_prompt, ai_schema, ai_count, delay_ms, description, is_active, \
         created_at, updated_at, ai_mode, ai_cache_ttl_ms, ai_pool_size \
         FROM mock_endpoints WHERE server_id = ?1 ORDER BY created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => return json!({"success": false, "error": e.to_string()}),
    };

    let rows: Vec<Value> = match stmt.query_map(rusqlite::params![server_id], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "server_id": row.get::<_, String>(1)?,
            "method": row.get::<_, String>(2)?,
            "path": row.get::<_, String>(3)?,
            "status_code": row.get::<_, i64>(4)?,
            "response_headers": row.get::<_, String>(5)?,
            "response_body": row.get::<_, String>(6)?,
            "response_type": row.get::<_, String>(7)?,
            "ai_prompt": row.get::<_, String>(8).unwrap_or_default(),
            "ai_schema": row.get::<_, String>(9).unwrap_or_default(),
            "ai_count": row.get::<_, i64>(10).unwrap_or(1),
            "delay_ms": row.get::<_, i64>(11).unwrap_or(0),
            "description": row.get::<_, String>(12).unwrap_or_default(),
            "is_active": row.get::<_, bool>(13).unwrap_or(true),
            "created_at": row.get::<_, String>(14)?,
            "updated_at": row.get::<_, String>(15)?,
            "ai_mode": row.get::<_, String>(16).unwrap_or_else(|_| "live".to_string()),
            "ai_cache_ttl_ms": row.get::<_, i64>(17).unwrap_or(60000),
            "ai_pool_size": row.get::<_, i64>(18).unwrap_or(5),
        }))
    }) {
        Ok(mapped) => mapped.filter_map(|r| r.ok()).collect(),
        Err(_) => vec![],
    };

    json!({ "success": true, "data": rows })
}
