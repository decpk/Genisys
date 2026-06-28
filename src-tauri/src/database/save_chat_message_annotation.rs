use rusqlite::params;

use super::Database;
use crate::types::MessageAnnotation;

/// Upsert a chat message annotation, keyed by `message_id`.
/// Creates a new annotation row if none exists for the message,
/// otherwise updates the existing one in place and bumps `updated_at`.
pub fn save_chat_message_annotation_db(
    db: &Database,
    annotation: &MessageAnnotation,
) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "INSERT INTO chat_message_annotations
            (id, message_id, task_summary, chosen_option, reasoning, alternatives, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(message_id) DO UPDATE SET
            task_summary = excluded.task_summary,
            chosen_option = excluded.chosen_option,
            reasoning = excluded.reasoning,
            alternatives = excluded.alternatives,
            updated_at = excluded.updated_at",
        params![
            annotation.id,
            annotation.message_id,
            annotation.task_summary,
            annotation.chosen_option,
            annotation.reasoning,
            annotation.alternatives,
            annotation.created_at,
            annotation.updated_at,
        ],
    )
    .map_err(|e| format!("save_chat_message_annotation: {e}"))?;
    Ok(())
}
