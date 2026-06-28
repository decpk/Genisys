use rusqlite::params;

use super::Database;

pub fn remove_note_highlight_db(db: &Database, highlight_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM note_highlights WHERE id=?1", params![highlight_id]) {
        eprintln!("[db] remove_note_highlight: {e}");
    }
}
