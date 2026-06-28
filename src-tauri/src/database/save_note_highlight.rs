use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_note_highlight_db(db: &Database, highlight: &NoteHighlight) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO note_highlights (id, note_id, text, from_pos, to_pos, note, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        params![
            highlight.id,
            highlight.note_id,
            highlight.text,
            highlight.from_pos,
            highlight.to_pos,
            highlight.note,
            highlight.created_at,
            highlight.updated_at
        ],
    ) {
        eprintln!("[db] save_note_highlight: {e}");
    }
}
