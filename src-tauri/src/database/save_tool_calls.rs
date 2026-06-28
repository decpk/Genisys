use rusqlite::params;

use super::Database;
use crate::types::ToolCallRecord;

/// Batch-insert tool calls for a single assistant message.
pub fn save_tool_calls_db(
    db: &Database,
    tool_calls: &[ToolCallRecord],
) -> Result<(), String> {
    if tool_calls.is_empty() {
        return Ok(());
    }
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        let msg = format!("begin txn: {e}");
        eprintln!("[db] save_tool_calls {msg}");
        return Err(msg);
    }
    for tc in tool_calls {
        if let Err(e) = conn.execute(
            "INSERT OR REPLACE INTO tool_calls (id, message_id, conversation_id, tool_name, args, result, status, started_at, completed_at, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                tc.id,
                tc.message_id,
                tc.conversation_id,
                tc.tool_name,
                tc.args,
                tc.result,
                tc.status,
                tc.started_at,
                tc.completed_at,
                tc.sort_order,
            ],
        ) {
            let msg = format!("insert tool_call: {e}");
            eprintln!("[db] save_tool_calls {msg}");
            let _ = conn.execute_batch("ROLLBACK");
            return Err(msg);
        }
    }
    if let Err(e) = conn.execute_batch("COMMIT") {
        let msg = format!("commit: {e}");
        eprintln!("[db] save_tool_calls {msg}");
        let _ = conn.execute_batch("ROLLBACK");
        return Err(msg);
    }
    Ok(())
}
