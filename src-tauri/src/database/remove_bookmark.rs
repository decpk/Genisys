use super::Database;

pub fn remove_bookmark_db(db: &Database, bookmark_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM bookmarks WHERE id = ?1",
        rusqlite::params![bookmark_id],
    ) {
        eprintln!("[db] remove_bookmark: {e}");
    }
}
