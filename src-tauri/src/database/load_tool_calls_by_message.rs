use rusqlite::params;

use super::Database;
use crate::types::ToolCallRecord;

/// Load all tool calls for a specific message, ordered by sort_order.
pub fn load_tool_calls_by_message_db(db: &Database, message_id: &str) -> Vec<ToolCallRecord> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, message_id, conversation_id, tool_name, args, result, status, started_at, completed_at, sort_order
         FROM tool_calls
         WHERE message_id = ?1
         ORDER BY sort_order ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_tool_calls_by_message prepare: {e}");
            return Vec::new();
        }
    };
    stmt.query_map(params![message_id], |row| {
        Ok(ToolCallRecord {
            id: row.get(0)?,
            message_id: row.get(1)?,
            conversation_id: row.get(2)?,
            tool_name: row.get(3)?,
            args: row.get(4)?,
            result: row.get(5)?,
            status: row.get(6)?,
            started_at: row.get(7)?,
            completed_at: row.get(8)?,
            sort_order: row.get(9)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
