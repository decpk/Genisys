use rusqlite::params;

use super::Database;

pub fn rename_webpage_db(db: &Database, id: &str, name: &str, updated_at: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE saved_webpages SET name = ?2, updated_at = ?3 WHERE id = ?1",
        params![id, name, updated_at],
    ) {
        eprintln!("[db] rename_webpage: {e}");
    }
}
