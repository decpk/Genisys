use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn duplicate_note_db(db: &Database, note_id: &str) -> Option<Note> {
    let conn = db.conn();
    // Load original note
    let original = conn.query_row(
        "SELECT id, app_id, scope_type, scope_id, title, content, is_pinned, created_at, updated_at,
                notebook_id, section_id, topic_id, source, sort_order, color, emoji, is_favorite
         FROM notes WHERE id = ?1",
        params![note_id],
        |row| {
            let is_pinned: i64 = row.get(6)?;
            let sort_order: i64 = row.get::<_, Option<i64>>(13)?.unwrap_or(0);
            let is_favorite: i64 = row.get::<_, Option<i64>>(16)?.unwrap_or(0);
            Ok(Note {
                id: row.get(0)?,
                app_id: row.get(1)?,
                scope_type: row.get(2)?,
                scope_id: row.get(3)?,
                title: row.get(4)?,
                content: row.get(5)?,
                is_pinned: is_pinned != 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                notebook_id: row.get(9)?,
                section_id: row.get(10)?,
                topic_id: row.get(11)?,
                labels: vec![],
                source: row.get(12)?,
                sort_order,
                color: row.get(14)?,
                emoji: row.get(15)?,
                is_favorite: is_favorite != 0,
                is_trashed: false,
                trashed_at: None,
            })
        },
    ).ok()?;

    // Load original labels
    let labels = super::load_labels_for_note_with_conn(&conn, note_id);

    let now = chrono::Utc::now().to_rfc3339();
    let new_id = uuid::Uuid::new_v4().to_string();
    let new_title = if original.title.is_empty() {
        "Untitled (Copy)".to_string()
    } else {
        format!("{} (Copy)", original.title)
    };

    let new_note = Note {
        id: new_id,
        title: new_title,
        created_at: now.clone(),
        updated_at: now,
        is_pinned: false,
        is_favorite: false,
        is_trashed: false,
        trashed_at: None,
        labels: labels.clone(),
        ..original
    };

    // Save the duplicate
    super::save_note_db(db, &new_note);

    Some(new_note)
}
