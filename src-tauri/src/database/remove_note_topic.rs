use rusqlite::params;
use super::Database;

pub fn remove_note_topic_db(db: &Database, topic_id: &str) {
    let conn = db.conn();
    // Clear topic_id on notes before deleting
    let _ = conn.execute(
        "UPDATE notes SET topic_id = NULL WHERE topic_id = ?1",
        params![topic_id],
    );
    if let Err(e) = conn.execute("DELETE FROM note_topics WHERE id=?1", params![topic_id]) {
        eprintln!("[db] remove_note_topic: {e}");
    }
}
