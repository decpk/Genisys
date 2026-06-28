use super::Database;

pub fn load_chapter_content_db(db: &Database, chapter_id: &str) -> Option<String> {
    let conn = db.reader();

    conn.query_row(
        "SELECT content FROM chapters WHERE id = ?1",
        rusqlite::params![chapter_id],
        |row| row.get(0),
    )
    .ok()
}
