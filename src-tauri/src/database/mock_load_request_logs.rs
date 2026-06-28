use rusqlite::types::Value as SqlValue;
use rusqlite::ToSql;
use serde_json::{json, Value};

use super::Database;

/// Load persisted request logs for a server, newest first.
///
/// Optional filters are combined with AND. The WHERE clause is built
/// dynamically but every user-supplied value is bound as a positional
/// parameter — no value is ever interpolated into the SQL string, so this is
/// safe against SQL injection. `limit` defaults to 500 and is clamped to
/// [1, 5000]. Header columns (stored as JSON strings) are parsed back into
/// JSON objects so the shape matches the live `mock-server-request-log` event.
pub fn mock_load_request_logs_db(
    db: &Database,
    server_id: &str,
    method: Option<String>,
    status: Option<i64>,
    path_contains: Option<String>,
    limit: Option<i64>,
) -> Vec<Value> {
    let conn = db.reader();

    let mut sql = String::from(
        "SELECT id, server_id, method, path, status, timestamp, duration_ms, \
         request_headers, request_body, query_string, response_headers, response_body \
         FROM mock_request_logs WHERE server_id = ?1",
    );
    let mut binds: Vec<SqlValue> = vec![SqlValue::Text(server_id.to_string())];

    if let Some(m) = method {
        if !m.is_empty() {
            binds.push(SqlValue::Text(m));
            sql.push_str(&format!(" AND method = ?{}", binds.len()));
        }
    }
    if let Some(s) = status {
        binds.push(SqlValue::Integer(s));
        sql.push_str(&format!(" AND status = ?{}", binds.len()));
    }
    if let Some(p) = path_contains {
        if !p.is_empty() {
            binds.push(SqlValue::Text(format!("%{p}%")));
            sql.push_str(&format!(" AND path LIKE ?{}", binds.len()));
        }
    }

    let lim = limit.unwrap_or(500).clamp(1, 5000);
    binds.push(SqlValue::Integer(lim));
    sql.push_str(&format!(" ORDER BY timestamp DESC LIMIT ?{}", binds.len()));

    let mut stmt = match conn.prepare(&sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] mock_load_request_logs prepare: {e}");
            return vec![];
        }
    };

    let param_refs: Vec<&dyn ToSql> = binds.iter().map(|v| v as &dyn ToSql).collect();

    stmt.query_map(param_refs.as_slice(), |row| {
        let req_headers: String = row.get(7)?;
        let resp_headers: String = row.get(10)?;
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "server_id": row.get::<_, String>(1)?,
            "method": row.get::<_, String>(2)?,
            "path": row.get::<_, String>(3)?,
            "status": row.get::<_, i64>(4)?,
            "timestamp": row.get::<_, String>(5)?,
            "duration_ms": row.get::<_, i64>(6)?,
            "request_headers": serde_json::from_str::<Value>(&req_headers).unwrap_or_else(|_| json!({})),
            "request_body": row.get::<_, String>(8)?,
            "query_string": row.get::<_, String>(9)?,
            "response_headers": serde_json::from_str::<Value>(&resp_headers).unwrap_or_else(|_| json!({})),
            "response_body": row.get::<_, String>(11)?,
        }))
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
