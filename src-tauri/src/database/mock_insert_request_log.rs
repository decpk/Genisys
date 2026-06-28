use rusqlite::params;

use super::Database;

/// Persist a single mock-server request log row. Generates a fresh UUID id.
///
/// This runs inside the live request handler, so it must never panic or block
/// the response: any failure is logged and swallowed. `request_headers` and
/// `response_headers` are expected to be pre-serialized JSON strings.
#[allow(clippy::too_many_arguments)]
pub fn mock_insert_request_log_db(
    db: &Database,
    server_id: &str,
    method: &str,
    path: &str,
    status: i64,
    timestamp: &str,
    duration_ms: i64,
    request_headers: &str,
    request_body: &str,
    query_string: &str,
    response_headers: &str,
    response_body: &str,
) {
    let conn = db.conn();
    let id = uuid::Uuid::new_v4().to_string();
    if let Err(e) = conn.execute(
        "INSERT INTO mock_request_logs \
         (id, server_id, method, path, status, timestamp, duration_ms, \
          request_headers, request_body, query_string, response_headers, response_body) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            id,
            server_id,
            method,
            path,
            status,
            timestamp,
            duration_ms,
            request_headers,
            request_body,
            query_string,
            response_headers,
            response_body,
        ],
    ) {
        eprintln!("[db] mock_insert_request_log: {e}");
    }
}
