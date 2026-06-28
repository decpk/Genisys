use super::Database;

pub fn remove_webpage_db(db: &Database, id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM saved_webpages WHERE id = ?1",
        rusqlite::params![id],
    ) {
        eprintln!("[db] remove_webpage: {e}");
    }
}
