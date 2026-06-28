use rusqlite::params;
use super::Database;
use crate::types::*;

fn row_to_section(row: &rusqlite::Row<'_>) -> rusqlite::Result<NoteSection> {
    Ok(NoteSection {
        id: row.get(0)?,
        notebook_id: row.get(1)?,
        name: row.get(2)?,
        color: row.get(3)?,
        icon: row.get(4)?,
        emoji: row.get(5)?,
        sort_order: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

pub fn load_note_sections_db(db: &Database, notebook_id: Option<&str>) -> Vec<NoteSection> {
    let conn = db.reader();
    match notebook_id {
        Some(nid) => {
            let mut stmt = match conn.prepare(
                "SELECT id, notebook_id, name, color, icon, emoji, sort_order, created_at, updated_at
                 FROM note_sections WHERE notebook_id=?1 ORDER BY sort_order ASC, created_at ASC",
            ) {
                Ok(s) => s,
                Err(e) => { eprintln!("[db] load_note_sections prepare: {e}"); return vec![]; }
            };
            stmt.query_map(params![nid], |row| row_to_section(row))
                .map(|rows| rows.filter_map(|r| r.ok()).collect())
                .unwrap_or_default()
        }
        None => {
            let mut stmt = match conn.prepare(
                "SELECT id, notebook_id, name, color, icon, emoji, sort_order, created_at, updated_at
                 FROM note_sections ORDER BY sort_order ASC, created_at ASC",
            ) {
                Ok(s) => s,
                Err(e) => { eprintln!("[db] load_note_sections prepare: {e}"); return vec![]; }
            };
            stmt.query_map([], |row| row_to_section(row))
                .map(|rows| rows.filter_map(|r| r.ok()).collect())
                .unwrap_or_default()
        }
    }
}
