use rusqlite::params;

use super::Database;

pub fn remove_note_db(db: &Database, note_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM notes WHERE id=?1", params![note_id]) {
        eprintln!("[db] remove_note: {e}");
    }
}
