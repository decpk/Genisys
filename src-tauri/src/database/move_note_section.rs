use rusqlite::params;
use super::Database;

pub fn move_section_to_notebook_db(db: &Database, section_id: &str, new_notebook_id: &str) {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();

    // 1. Move the section
    let _ = conn.execute(
        "UPDATE note_sections SET notebook_id=?1, updated_at=?2 WHERE id=?3",
        params![new_notebook_id, now, section_id],
    );

    // 2. Cascade: pages directly in this section
    let _ = conn.execute(
        "UPDATE notes SET notebook_id=?1, updated_at=?2 WHERE section_id=?3",
        params![new_notebook_id, now, section_id],
    );

    // 3. Cascade: pages in topics that belong to this section
    let _ = conn.execute(
        "UPDATE notes SET notebook_id=?1, updated_at=?2
         WHERE topic_id IN (SELECT id FROM note_topics WHERE section_id=?3)",
        params![new_notebook_id, now, section_id],
    );
}
