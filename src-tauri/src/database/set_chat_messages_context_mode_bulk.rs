use rusqlite::params;

use super::Database;

/// Apply the same `context_mode` value to many chat messages in one transaction.
/// Used by the Context panel's bulk actions ("Include all", "Exclude all before
/// this one", "Reset to auto"). Passing an empty `message_ids` slice is a no-op.
///
/// See [`set_chat_message_context_mode_db`](super::set_chat_message_context_mode_db)
/// for the meaning of `mode`.
pub fn set_chat_messages_context_mode_bulk_db(
    db: &Database,
    message_ids: &[String],
    mode: Option<i64>,
) -> Result<(), String> {
    if message_ids.is_empty() {
        return Ok(());
    }
    let conn = db.conn();
    conn.execute_batch("BEGIN IMMEDIATE")
        .map_err(|e| format!("begin txn: {e}"))?;
    {
        let mut stmt = match conn
            .prepare("UPDATE chat_messages SET context_mode = ?1 WHERE id = ?2")
        {
            Ok(s) => s,
            Err(e) => {
                let _ = conn.execute_batch("ROLLBACK");
                return Err(format!("prepare: {e}"));
            }
        };
        for id in message_ids {
            if let Err(e) = stmt.execute(params![mode, id]) {
                let _ = conn.execute_batch("ROLLBACK");
                return Err(format!("update {id}: {e}"));
            }
        }
    }
    conn.execute_batch("COMMIT").map_err(|e| {
        let _ = conn.execute_batch("ROLLBACK");
        format!("commit: {e}")
    })?;
    Ok(())
}
