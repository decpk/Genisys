use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn load_note_highlights_db(db: &Database, note_id: &str) -> Vec<NoteHighlight> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, note_id, text, from_pos, to_pos, note, created_at, updated_at
         FROM note_highlights
         WHERE note_id = ?1
         ORDER BY created_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_note_highlights prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map(params![note_id], |row| {
        Ok(NoteHighlight {
            id: row.get(0)?,
            note_id: row.get(1)?,
            text: row.get(2)?,
            from_pos: row.get(3)?,
            to_pos: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
