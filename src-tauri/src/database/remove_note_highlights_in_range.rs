use rusqlite::params;

use super::Database;

pub fn remove_note_highlights_in_range_db(db: &Database, note_id: &str, from_pos: i64, to_pos: i64) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM note_highlights WHERE note_id=?1 AND from_pos < ?3 AND to_pos > ?2",
        params![note_id, from_pos, to_pos],
    ) {
        eprintln!("[db] remove_note_highlights_in_range: {e}");
    }
}
