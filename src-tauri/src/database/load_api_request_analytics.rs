use rusqlite::params;

use super::Database;
use crate::types::ApiAnalyticsPoint;

pub fn load_api_request_analytics_db(db: &Database, request_id: &str, since: &str) -> Vec<ApiAnalyticsPoint> {
    let conn = db.reader();
    conn.prepare(
        "SELECT e.id, e.executed_at, e.method, e.status,
                COALESCE(r.status_code, 0), e.duration_ms, COALESCE(r.size_bytes, 0),
                r.timing_dns_ms, r.timing_connect_ms, r.timing_tls_ms, r.timing_ttfb_ms, r.timing_download_ms
         FROM api_request_executions e
         LEFT JOIN api_execution_responses r ON r.execution_id = e.id
         WHERE e.request_id = ?1 AND e.executed_at >= ?2
         ORDER BY e.executed_at ASC
         LIMIT 5000",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![request_id, since], |row| {
            Ok(ApiAnalyticsPoint {
                id: row.get(0)?,
                executed_at: row.get(1)?,
                method: row.get(2)?,
                status: row.get(3)?,
                status_code: row.get(4)?,
                duration_ms: row.get(5)?,
                size_bytes: row.get(6)?,
                timing_dns_ms: row.get(7)?,
                timing_connect_ms: row.get(8)?,
                timing_tls_ms: row.get(9)?,
                timing_ttfb_ms: row.get(10)?,
                timing_download_ms: row.get(11)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}
