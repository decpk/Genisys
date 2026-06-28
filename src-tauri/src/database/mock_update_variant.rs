use rusqlite::params;
use serde_json::{json, Value};

use super::Database;

/// Update the editable fields of an existing variant. Refreshes `updated_at`.
/// Returns the updated row as a JSON object, or an error string on failure.
#[allow(clippy::too_many_arguments)]
pub fn mock_update_variant_db(
    db: &Database,
    id: &str,
    name: Option<String>,
    status_code: Option<i64>,
    response_headers: Option<String>,
    response_body: Option<String>,
    match_rules: Option<String>,
    weight: Option<i64>,
    order_index: Option<i64>,
    is_active: Option<bool>,
) -> Result<Value, String> {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();
    let is_active_i64 = is_active.map(|v| if v { 1_i64 } else { 0_i64 });

    let affected = conn
        .execute(
            "UPDATE mock_endpoint_variants SET \
             name = COALESCE(?2, name), status_code = COALESCE(?3, status_code), \
             response_headers = COALESCE(?4, response_headers), response_body = COALESCE(?5, response_body), \
             match_rules = COALESCE(?6, match_rules), weight = COALESCE(?7, weight), \
             order_index = COALESCE(?8, order_index), is_active = COALESCE(?9, is_active), updated_at = ?10 \
             WHERE id = ?1",
            params![
                id,
                name,
                status_code,
                response_headers,
                response_body,
                match_rules,
                weight,
                order_index,
                is_active_i64,
                now,
            ],
        )
        .map_err(|e| e.to_string())?;

    if affected == 0 {
        return Err(format!("Variant not found: {id}"));
    }

    conn.query_row(
        "SELECT id, endpoint_id, name, status_code, response_headers, response_body, \
         match_rules, weight, order_index, is_active, created_at, updated_at \
         FROM mock_endpoint_variants WHERE id = ?1",
        params![id],
        |row| {
            let is_active: i64 = row.get::<_, Option<i64>>(9)?.unwrap_or(1);
            Ok(json!({
                "id": row.get::<_, String>(0)?,
                "endpoint_id": row.get::<_, String>(1)?,
                "name": row.get::<_, String>(2)?,
                "status_code": row.get::<_, i64>(3)?,
                "response_headers": row.get::<_, String>(4)?,
                "response_body": row.get::<_, String>(5)?,
                "match_rules": row.get::<_, String>(6)?,
                "weight": row.get::<_, i64>(7)?,
                "order_index": row.get::<_, i64>(8)?,
                "is_active": is_active != 0,
                "created_at": row.get::<_, String>(10)?,
                "updated_at": row.get::<_, String>(11)?,
            }))
        },
    )
    .map_err(|e| e.to_string())
}
