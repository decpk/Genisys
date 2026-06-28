use rusqlite::params;

use super::Database;
use crate::types::ToolCallSummary;

/// Load per-message tool call summaries for a conversation (lightweight aggregate).
pub fn load_tool_call_summaries_db(db: &Database, conversation_id: &str) -> Vec<ToolCallSummary> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT
             message_id,
             COUNT(*) AS total_count,
             SUM(CASE WHEN status != 'running' THEN 1 ELSE 0 END) AS done_count,
             MIN(started_at) AS first_started_at,
             MAX(completed_at) AS last_completed_at,
             COALESCE(SUM(
                 CASE WHEN completed_at IS NOT NULL
                      THEN CAST((julianday(completed_at) - julianday(started_at)) * 86400000 AS INTEGER)
                      ELSE 0
                 END
             ), 0) AS total_duration_ms
         FROM tool_calls
         WHERE conversation_id = ?1
         GROUP BY message_id
         ORDER BY MIN(started_at) ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_tool_call_summaries prepare: {e}");
            return Vec::new();
        }
    };
    stmt.query_map(params![conversation_id], |row| {
        Ok(ToolCallSummary {
            message_id: row.get(0)?,
            total_count: row.get(1)?,
            done_count: row.get(2)?,
            first_started_at: row.get(3)?,
            last_completed_at: row.get(4)?,
            total_duration_ms: row.get(5)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
