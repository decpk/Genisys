use rusqlite::params;

use super::Database;

pub fn restore_note_from_trash_db(db: &Database, note_id: &str) {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();
    if let Err(e) = conn.execute(
        "UPDATE notes SET is_trashed = 0, trashed_at = NULL, updated_at = ?2 WHERE id = ?1",
        params![note_id, now],
    ) {
        eprintln!("[db] restore_note_from_trash: {e}");
    }
}
