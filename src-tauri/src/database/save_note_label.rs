use rusqlite::params;
use super::Database;
use crate::types::*;

pub fn save_note_label_db(db: &Database, label: &NoteLabel) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO note_labels (id, name, color, created_at)
         VALUES (?1,?2,?3,?4)",
        params![label.id, label.name, label.color, label.created_at],
    ) {
        eprintln!("[db] save_note_label: {e}");
    }
}
