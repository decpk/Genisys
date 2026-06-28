use super::Database;

pub fn remove_book_db(db: &Database, book_id: &str) {
    let conn = db.conn();
    // Chapters will be deleted by CASCADE
    if let Err(e) = conn.execute("DELETE FROM books WHERE id = ?1", rusqlite::params![book_id]) {
        eprintln!("[db] remove_book: {e}");
    }
}
