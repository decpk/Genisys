use rusqlite::params;
use super::Database;

pub fn move_note_db(
    db: &Database,
    note_id: &str,
    notebook_id: Option<&str>,
    section_id: Option<&str>,
    topic_id: Option<&str>,
) {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();
    if let Err(e) = conn.execute(
        "UPDATE notes SET notebook_id=?1, section_id=?2, topic_id=?3, updated_at=?4 WHERE id=?5",
        params![notebook_id, section_id, topic_id, now, note_id],
    ) {
        eprintln!("[db] move_note: {e}");
    }
}
