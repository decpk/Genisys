use rusqlite::params;
use super::Database;

pub fn reorder_note_topics_db(db: &Database, ordered_ids: &[String]) {
    let conn = db.conn();
    for (i, id) in ordered_ids.iter().enumerate() {
        let _ = conn.execute(
            "UPDATE note_topics SET sort_order=?1 WHERE id=?2",
            params![i as i64, id],
        );
    }
}
