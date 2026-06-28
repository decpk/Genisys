use rusqlite::params;
use super::Database;

pub fn remove_note_label_db(db: &Database, label_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM note_labels WHERE id=?1", params![label_id]) {
        eprintln!("[db] remove_note_label: {e}");
    }
}
