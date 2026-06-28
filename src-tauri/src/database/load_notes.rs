use rusqlite::params;
use super::Database;
use crate::types::*;

pub fn load_notes_db(db: &Database, app_id: &str, scope_type: &str, scope_id: &str) -> Vec<Note> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, app_id, scope_type, scope_id, title, content, is_pinned, created_at, updated_at,
                notebook_id, section_id, topic_id, source, sort_order, color, emoji,
                is_favorite, is_trashed, trashed_at
         FROM notes
         WHERE app_id=?1 AND scope_type=?2 AND scope_id=?3 AND (is_trashed = 0 OR is_trashed IS NULL)
         ORDER BY is_pinned DESC, sort_order ASC, updated_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_notes prepare: {e}");
            return vec![];
        }
    };
    let mut notes: Vec<Note> = stmt
        .query_map(params![app_id, scope_type, scope_id], |row| {
            let is_pinned: i64 = row.get(6)?;
            let sort_order: i64 = row.get::<_, Option<i64>>(13)?.unwrap_or(0);
            let is_favorite: i64 = row.get::<_, Option<i64>>(16)?.unwrap_or(0);
            let is_trashed: i64 = row.get::<_, Option<i64>>(17)?.unwrap_or(0);
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
                is_trashed: is_trashed != 0,
                trashed_at: row.get(18)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    // Populate labels for each note (reuse already-acquired conn to avoid deadlock)
    for note in &mut notes {
        note.labels = super::load_labels_for_note_with_conn(&conn, &note.id);
    }

    notes
}

/// Load ALL notes (for notes app — no scope filter, excludes trashed)
pub fn load_all_notes_db(db: &Database) -> Vec<Note> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, app_id, scope_type, scope_id, title, content, is_pinned, created_at, updated_at,
                notebook_id, section_id, topic_id, source, sort_order, color, emoji,
                is_favorite, is_trashed, trashed_at
         FROM notes
         WHERE is_trashed = 0 OR is_trashed IS NULL
         ORDER BY is_pinned DESC, sort_order ASC, updated_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_all_notes prepare: {e}");
            return vec![];
        }
    };
    let mut notes: Vec<Note> = stmt
        .query_map([], |row| {
            let is_pinned: i64 = row.get(6)?;
            let sort_order: i64 = row.get::<_, Option<i64>>(13)?.unwrap_or(0);
            let is_favorite: i64 = row.get::<_, Option<i64>>(16)?.unwrap_or(0);
            let is_trashed: i64 = row.get::<_, Option<i64>>(17)?.unwrap_or(0);
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
                is_trashed: is_trashed != 0,
                trashed_at: row.get(18)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    for note in &mut notes {
        note.labels = super::load_labels_for_note_with_conn(&conn, &note.id);
    }

    notes
}

/// Load only trashed notes
pub fn load_trashed_notes_db(db: &Database) -> Vec<Note> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, app_id, scope_type, scope_id, title, content, is_pinned, created_at, updated_at,
                notebook_id, section_id, topic_id, source, sort_order, color, emoji,
                is_favorite, is_trashed, trashed_at
         FROM notes
         WHERE is_trashed = 1
         ORDER BY trashed_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_trashed_notes prepare: {e}");
            return vec![];
        }
    };
    let mut notes: Vec<Note> = stmt
        .query_map([], |row| {
            let is_pinned: i64 = row.get(6)?;
            let sort_order: i64 = row.get::<_, Option<i64>>(13)?.unwrap_or(0);
            let is_favorite: i64 = row.get::<_, Option<i64>>(16)?.unwrap_or(0);
            let is_trashed: i64 = row.get::<_, Option<i64>>(17)?.unwrap_or(0);
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
                is_trashed: is_trashed != 0,
                trashed_at: row.get(18)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    for note in &mut notes {
        note.labels = super::load_labels_for_note_with_conn(&conn, &note.id);
    }

    notes
}
