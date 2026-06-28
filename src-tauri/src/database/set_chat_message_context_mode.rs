use rusqlite::params;

use super::Database;

/// Update a single chat message's context inclusion mode.
/// `mode` semantics:
///   - `None`     → auto (governed by the conversation's auto-window)
///   - `Some(1)`  → force include in the AI prompt
///   - `Some(0)`  → force exclude from the AI prompt
pub fn set_chat_message_context_mode_db(
    db: &Database,
    message_id: &str,
    mode: Option<i64>,
) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "UPDATE chat_messages SET context_mode = ?1 WHERE id = ?2",
        params![mode, message_id],
    )
    .map_err(|e| format!("set_chat_message_context_mode: {e}"))?;
    Ok(())
}
