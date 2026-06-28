use rusqlite::params;
use super::Database;

pub fn remove_note_section_db(db: &Database, section_id: &str) {
    let conn = db.conn();
    // Clear topic_id for notes in topics belonging to this section
    let _ = conn.execute(
        "UPDATE notes SET topic_id = NULL WHERE topic_id IN (SELECT id FROM note_topics WHERE section_id = ?1)",
        params![section_id],
    );
    // Clear section_id for notes directly in this section
    let _ = conn.execute(
        "UPDATE notes SET section_id = NULL WHERE section_id = ?1",
        params![section_id],
    );
    if let Err(e) = conn.execute("DELETE FROM note_sections WHERE id=?1", params![section_id]) {
        eprintln!("[db] remove_note_section: {e}");
    }
}
