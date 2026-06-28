use rusqlite::params;
use serde_json::{json, Value};

use super::Database;

/// Insert a new variant for an endpoint. Generates a fresh UUID and timestamps.
/// Returns the inserted row as a JSON object, or an error string on failure.
#[allow(clippy::too_many_arguments)]
pub fn mock_create_variant_db(
    db: &Database,
    endpoint_id: &str,
    name: &str,
    status_code: i64,
    response_headers: &str,
    response_body: &str,
    match_rules: &str,
    weight: i64,
    order_index: i64,
    is_active: bool,
) -> Result<Value, String> {
    let conn = db.conn();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO mock_endpoint_variants \
         (id, endpoint_id, name, status_code, response_headers, response_body, \
          match_rules, weight, order_index, is_active, created_at, updated_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            id,
            endpoint_id,
            name,
            status_code,
            response_headers,
            response_body,
            match_rules,
            weight,
            order_index,
            if is_active { 1 } else { 0 },
            now,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(json!({
        "id": id,
        "endpoint_id": endpoint_id,
        "name": name,
        "status_code": status_code,
        "response_headers": response_headers,
        "response_body": response_body,
        "match_rules": match_rules,
        "weight": weight,
        "order_index": order_index,
        "is_active": is_active,
        "created_at": now,
        "updated_at": now,
    }))
}
