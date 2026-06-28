use rusqlite::params;
use super::Database;

pub fn move_topic_to_section_db(db: &Database, topic_id: &str, new_section_id: &str) {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();

    // Look up the new section's notebook_id
    let new_notebook_id: Option<String> = conn
        .prepare("SELECT notebook_id FROM note_sections WHERE id=?1")
        .ok()
        .and_then(|mut stmt| stmt.query_row(params![new_section_id], |row| row.get(0)).ok());

    // 1. Move the topic
    let _ = conn.execute(
        "UPDATE note_topics SET section_id=?1, updated_at=?2 WHERE id=?3",
        params![new_section_id, now, topic_id],
    );

    // 2. Cascade: update all pages in this topic
    if let Some(ref nb_id) = new_notebook_id {
        let _ = conn.execute(
            "UPDATE notes SET section_id=?1, notebook_id=?2, updated_at=?3 WHERE topic_id=?4",
            params![new_section_id, nb_id, now, topic_id],
        );
    }
}
