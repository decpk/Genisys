use super::Database;

pub fn remove_chapter_db(db: &Database, chapter_id: &str, book_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM chapters WHERE id = ?1",
        rusqlite::params![chapter_id],
    ) {
        eprintln!("[db] remove_chapter: {e}");
    }

    // Update book's chapter_count
    let now = chrono::Utc::now().to_rfc3339();
    if let Err(e) = conn.execute(
        "UPDATE books SET
            chapter_count = (SELECT COUNT(*) FROM chapters WHERE book_id = ?1),
            updated_at = ?2
         WHERE id = ?1",
        rusqlite::params![book_id, now],
    ) {
        eprintln!("[db] update_book_chapter_count after remove: {e}");
    }
}
