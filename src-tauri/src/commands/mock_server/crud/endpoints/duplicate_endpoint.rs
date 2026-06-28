use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_duplicate_endpoint(state: State<'_, AppState>, id: String) -> Value {
    let conn = state.db.conn();

    // Read the existing endpoint
    let endpoint = match conn.query_row(
        "SELECT server_id, method, path, status_code, response_headers, response_body, \
         response_type, ai_prompt, ai_schema, ai_count, delay_ms, description \
         FROM mock_endpoints WHERE id = ?1",
        rusqlite::params![id],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, String>(7).unwrap_or_default(),
                row.get::<_, String>(8).unwrap_or_default(),
                row.get::<_, i64>(9).unwrap_or(1),
                row.get::<_, i64>(10).unwrap_or(0),
                row.get::<_, String>(11).unwrap_or_default(),
            ))
        },
    ) {
        Ok(ep) => ep,
        Err(e) => return json!({"success": false, "error": format!("Endpoint not found: {}", e)}),
    };

    let new_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let (server_id, method, path, status_code, response_headers, response_body, response_type, ai_prompt, ai_schema, ai_count, delay_ms, description) = endpoint;

    // Append " (copy)" to the path to differentiate
    let new_path = format!("{} (copy)", path);

    match conn.execute(
        "INSERT INTO mock_endpoints (id, server_id, method, path, status_code, response_headers, \
         response_body, response_type, ai_prompt, ai_schema, ai_count, delay_ms, description, \
         is_active, created_at, updated_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 1, ?14, ?15)",
        rusqlite::params![
            new_id, server_id, method, new_path, status_code, response_headers,
            response_body, response_type, ai_prompt, ai_schema, ai_count, delay_ms,
            description, now, now,
        ],
    ) {
        Ok(_) => json!({
            "success": true,
            "data": {
                "id": new_id,
                "server_id": server_id,
                "method": method,
                "path": new_path,
                "status_code": status_code,
                "response_headers": response_headers,
                "response_body": response_body,
                "response_type": response_type,
                "ai_prompt": ai_prompt,
                "ai_schema": ai_schema,
                "ai_count": ai_count,
                "delay_ms": delay_ms,
                "description": description,
                "is_active": true,
                "created_at": now,
                "updated_at": now,
            }
        }),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
