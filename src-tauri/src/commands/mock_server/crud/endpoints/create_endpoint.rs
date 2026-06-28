use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_create_endpoint(
    state: State<'_, AppState>,
    server_id: String,
    method: String,
    path: String,
    status_code: u16,
    response_headers: String,
    response_body: String,
    response_type: String,
    ai_prompt: Option<String>,
    ai_schema: Option<String>,
    ai_count: Option<i64>,
    delay_ms: Option<i64>,
    description: Option<String>,
) -> Value {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn();

    let ai_prompt = ai_prompt.unwrap_or_default();
    let ai_schema = ai_schema.unwrap_or_default();
    let ai_count = ai_count.unwrap_or(1);
    let delay_ms = delay_ms.unwrap_or(0);
    let description = description.unwrap_or_default();

    match conn.execute(
        "INSERT INTO mock_endpoints (id, server_id, method, path, status_code, response_headers, \
         response_body, response_type, ai_prompt, ai_schema, ai_count, delay_ms, description, \
         is_active, created_at, updated_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 1, ?14, ?15)",
        rusqlite::params![
            id, server_id, method, path, status_code as i64, response_headers, response_body,
            response_type, ai_prompt, ai_schema, ai_count, delay_ms, description, now, now,
        ],
    ) {
        Ok(_) => json!({
            "success": true,
            "data": {
                "id": id,
                "server_id": server_id,
                "method": method,
                "path": path,
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
                "variant_mode": "single",
                "ai_mode": "live",
                "ai_cache_ttl_ms": 60000,
                "ai_pool_size": 5,
            }
        }),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
