use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_update_endpoint(
    state: State<'_, AppState>,
    id: String,
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
    is_active: Option<bool>,
    variant_mode: Option<String>,
    ai_mode: Option<String>,
    ai_cache_ttl_ms: Option<i64>,
    ai_pool_size: Option<i64>,
) -> Value {
    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn();

    let ai_prompt = ai_prompt.unwrap_or_default();
    let ai_schema = ai_schema.unwrap_or_default();
    let ai_count = ai_count.unwrap_or(1);
    let delay_ms = delay_ms.unwrap_or(0);
    let description = description.unwrap_or_default();
    let is_active = is_active.unwrap_or(true);
    let variant_mode = variant_mode.unwrap_or_else(|| "single".to_string());
    let ai_mode = ai_mode.unwrap_or_else(|| "live".to_string());
    let ai_cache_ttl_ms = ai_cache_ttl_ms.unwrap_or(60000);
    let ai_pool_size = ai_pool_size.unwrap_or(5);

    match conn.execute(
        "UPDATE mock_endpoints SET method = ?1, path = ?2, status_code = ?3, \
         response_headers = ?4, response_body = ?5, response_type = ?6, \
         ai_prompt = ?7, ai_schema = ?8, ai_count = ?9, delay_ms = ?10, \
         description = ?11, is_active = ?12, variant_mode = ?13, \
         ai_mode = ?14, ai_cache_ttl_ms = ?15, ai_pool_size = ?16, \
         updated_at = ?17 WHERE id = ?18",
        rusqlite::params![
            method, path, status_code as i64, response_headers, response_body,
            response_type, ai_prompt, ai_schema, ai_count, delay_ms, description,
            is_active, variant_mode, ai_mode, ai_cache_ttl_ms, ai_pool_size, now, id,
        ],
    ) {
        Ok(changed) if changed > 0 => json!({"success": true}),
        Ok(_) => json!({"success": false, "error": "Endpoint not found"}),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
