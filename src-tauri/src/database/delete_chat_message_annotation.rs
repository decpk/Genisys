use rusqlite::params;

use super::Database;

/// Remove the annotation attached to a single chat message.
/// Returns Ok even if no annotation existed (idempotent delete).
pub fn delete_chat_message_annotation_db(
    db: &Database,
    message_id: &str,
) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "DELETE FROM chat_message_annotations WHERE message_id = ?1",
        params![message_id],
    )
    .map_err(|e| format!("delete_chat_message_annotation: {e}"))?;
    Ok(())
}
