use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_note_db(db: &Database, note: &Note) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO notes (id, app_id, scope_type, scope_id, title, content, is_pinned, created_at, updated_at, notebook_id, section_id, topic_id, source, sort_order, color, emoji, is_favorite, is_trashed, trashed_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)",
        params![
            note.id,
            note.app_id,
            note.scope_type,
            note.scope_id,
            note.title,
            note.content,
            note.is_pinned as i64,
            note.created_at,
            note.updated_at,
            note.notebook_id,
            note.section_id,
            note.topic_id,
            note.source,
            note.sort_order,
            note.color,
            note.emoji,
            note.is_favorite as i64,
            note.is_trashed as i64,
            note.trashed_at
        ],
    ) {
        eprintln!("[db] save_note: {e}");
    }

    // Persist labels via junction table (reuse already-acquired conn to avoid deadlock)
    super::set_note_labels_with_conn(&conn, &note.id, &note.labels);
}
