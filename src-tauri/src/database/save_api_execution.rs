use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_api_execution_db(db: &Database, exec: &ApiRequestExecution, resp: &ApiExecutionResponse) {
    let conn = db.conn();

    // Insert execution record
    if let Err(e) = conn.execute(
        "INSERT INTO api_request_executions (id, request_id, environment_id, workspace_id, name, method, url,
            resolved_url, headers_snapshot, body_snapshot, auth_snapshot, status, error_message, duration_ms,
            executed_at, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16)",
        params![
            exec.id,
            exec.request_id,
            exec.environment_id,
            exec.workspace_id,
            exec.name,
            exec.method,
            exec.url,
            exec.resolved_url,
            exec.headers_snapshot,
            exec.body_snapshot,
            exec.auth_snapshot,
            exec.status,
            exec.error_message,
            exec.duration_ms,
            exec.executed_at,
            exec.created_at,
        ],
    ) {
        eprintln!("[db] save_api_execution: {e}");
        return;
    }

    // Insert response record
    if let Err(e) = conn.execute(
        "INSERT INTO api_execution_responses (id, execution_id, status_code, status_text, headers, body,
            body_storage_type, blob_path, size_bytes, timing_total_ms, timing_dns_ms, timing_connect_ms,
            timing_tls_ms, timing_ttfb_ms, timing_download_ms, received_at, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)",
        params![
            resp.id,
            resp.execution_id,
            resp.status_code,
            resp.status_text,
            resp.headers,
            resp.body,
            resp.body_storage_type,
            resp.blob_path,
            resp.size_bytes,
            resp.timing_total_ms,
            resp.timing_dns_ms,
            resp.timing_connect_ms,
            resp.timing_tls_ms,
            resp.timing_ttfb_ms,
            resp.timing_download_ms,
            resp.received_at,
            resp.created_at,
        ],
    ) {
        eprintln!("[db] save_api_execution_response: {e}");
    }
}

pub fn load_api_history_db(db: &Database, workspace_id: &str, limit: i64, offset: i64) -> Vec<ApiHistoryEntry> {
    let conn = db.reader();
    conn.prepare(
        "SELECT e.id, e.request_id, e.name, e.method, e.url, e.status,
                COALESCE(r.status_code, 0), e.duration_ms, COALESCE(r.size_bytes, 0),
                e.executed_at, env.name
         FROM api_request_executions e
         LEFT JOIN api_execution_responses r ON r.execution_id = e.id
         LEFT JOIN api_environments env ON env.id = e.environment_id
         WHERE e.workspace_id = ?1
         ORDER BY e.executed_at DESC
         LIMIT ?2 OFFSET ?3",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![workspace_id, limit, offset], |row| {
            Ok(ApiHistoryEntry {
                id: row.get(0)?,
                request_id: row.get(1)?,
                name: row.get(2)?,
                method: row.get(3)?,
                url: row.get(4)?,
                status: row.get(5)?,
                status_code: row.get(6)?,
                duration_ms: row.get(7)?,
                size_bytes: row.get(8)?,
                executed_at: row.get(9)?,
                environment_name: row.get(10)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}

pub fn load_api_execution_response_db(db: &Database, execution_id: &str) -> Option<ApiExecutionResponse> {
    let conn = db.reader();
    conn.query_row(
        "SELECT id, execution_id, status_code, status_text, headers, body,
                body_storage_type, blob_path, size_bytes, timing_total_ms,
                timing_dns_ms, timing_connect_ms, timing_tls_ms, timing_ttfb_ms,
                timing_download_ms, received_at, created_at
         FROM api_execution_responses WHERE execution_id = ?1",
        params![execution_id],
        |row| {
            Ok(ApiExecutionResponse {
                id: row.get(0)?,
                execution_id: row.get(1)?,
                status_code: row.get(2)?,
                status_text: row.get(3)?,
                headers: row.get(4)?,
                body: row.get(5)?,
                body_storage_type: row.get(6)?,
                blob_path: row.get(7)?,
                size_bytes: row.get(8)?,
                timing_total_ms: row.get(9)?,
                timing_dns_ms: row.get(10)?,
                timing_connect_ms: row.get(11)?,
                timing_tls_ms: row.get(12)?,
                timing_ttfb_ms: row.get(13)?,
                timing_download_ms: row.get(14)?,
                received_at: row.get(15)?,
                created_at: row.get(16)?,
            })
        },
    )
    .ok()
}

pub fn remove_api_execution_db(db: &Database, execution_id: &str) {
    let conn = db.conn();
    // CASCADE deletes response too
    if let Err(e) = conn.execute(
        "DELETE FROM api_request_executions WHERE id = ?1",
        params![execution_id],
    ) {
        eprintln!("[db] remove_api_execution: {e}");
    }
}

pub fn clear_api_history_db(db: &Database, workspace_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_request_executions WHERE workspace_id = ?1",
        params![workspace_id],
    ) {
        eprintln!("[db] clear_api_history: {e}");
    }
}
