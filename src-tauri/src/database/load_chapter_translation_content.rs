use super::Database;

pub fn load_chapter_translation_content_db(
    db: &Database,
    chapter_id: &str,
    language: &str,
) -> Option<String> {
    let conn = db.reader();
    conn.query_row(
        "SELECT content FROM chapter_translations WHERE chapter_id = ?1 AND language = ?2",
        rusqlite::params![chapter_id, language],
        |row| row.get::<_, String>(0),
    )
    .ok()
}
