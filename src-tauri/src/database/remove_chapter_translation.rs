use super::Database;

pub fn remove_chapter_translation_db(db: &Database, chapter_id: &str, language: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM chapter_translations WHERE chapter_id = ?1 AND language = ?2",
        rusqlite::params![chapter_id, language],
    ) {
        eprintln!("[db] remove_chapter_translation: {e}");
    }
}
