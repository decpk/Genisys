use rusqlite::params;
use serde_json::{json, Value};

use super::Database;

/// Load all variants for a given endpoint, ordered by `order_index` ascending.
/// Returns each variant as a JSON object mirroring the column layout used by the
/// frontend `MockEndpointVariant` type.
pub fn mock_load_variants_db(db: &Database, endpoint_id: &str) -> Vec<Value> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, endpoint_id, name, status_code, response_headers, response_body, \
         match_rules, weight, order_index, is_active, created_at, updated_at \
         FROM mock_endpoint_variants WHERE endpoint_id = ?1 ORDER BY order_index ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] mock_load_variants prepare: {e}");
            return vec![];
        }
    };

    stmt.query_map(params![endpoint_id], |row| {
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
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
