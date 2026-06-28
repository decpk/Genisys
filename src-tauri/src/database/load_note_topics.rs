use rusqlite::params;
use super::Database;
use crate::types::*;

fn row_to_topic(row: &rusqlite::Row<'_>) -> rusqlite::Result<NoteTopic> {
    Ok(NoteTopic {
        id: row.get(0)?,
        section_id: row.get(1)?,
        name: row.get(2)?,
        color: row.get(3)?,
        icon: row.get(4)?,
        emoji: row.get(5)?,
        sort_order: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

pub fn load_note_topics_db(db: &Database, section_id: Option<&str>) -> Vec<NoteTopic> {
    let conn = db.reader();
    match section_id {
        Some(sid) => {
            let mut stmt = match conn.prepare(
                "SELECT id, section_id, name, color, icon, emoji, sort_order, created_at, updated_at
                 FROM note_topics WHERE section_id=?1 ORDER BY sort_order ASC, created_at ASC",
            ) {
                Ok(s) => s,
                Err(e) => { eprintln!("[db] load_note_topics prepare: {e}"); return vec![]; }
            };
            stmt.query_map(params![sid], |row| row_to_topic(row))
                .map(|rows| rows.filter_map(|r| r.ok()).collect())
                .unwrap_or_default()
        }
        None => {
            let mut stmt = match conn.prepare(
                "SELECT id, section_id, name, color, icon, emoji, sort_order, created_at, updated_at
                 FROM note_topics ORDER BY sort_order ASC, created_at ASC",
            ) {
                Ok(s) => s,
                Err(e) => { eprintln!("[db] load_note_topics prepare: {e}"); return vec![]; }
            };
            stmt.query_map([], |row| row_to_topic(row))
                .map(|rows| rows.filter_map(|r| r.ok()).collect())
                .unwrap_or_default()
        }
    }
}
