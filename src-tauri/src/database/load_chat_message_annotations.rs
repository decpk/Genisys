use rusqlite::params;

use super::Database;
use crate::types::MessageAnnotation;

/// Load all annotations for messages in a given conversation,
/// joined against `chat_messages` so callers do not need to pass
/// individual message ids.
pub fn load_chat_message_annotations_db(
    db: &Database,
    conversation_id: &str,
) -> Vec<MessageAnnotation> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT a.id, a.message_id, a.task_summary, a.chosen_option, a.reasoning, a.alternatives, a.created_at, a.updated_at
         FROM chat_message_annotations a
         INNER JOIN chat_messages m ON m.id = a.message_id
         WHERE m.conversation_id = ?1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_chat_message_annotations prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map(params![conversation_id], |row| {
        Ok(MessageAnnotation {
            id: row.get(0)?,
            message_id: row.get(1)?,
            task_summary: row.get(2)?,
            chosen_option: row.get(3)?,
            reasoning: row.get(4)?,
            alternatives: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
