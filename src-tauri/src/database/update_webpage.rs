use rusqlite::params;

use super::Database;

pub fn load_webpage_url_db(db: &Database, id: &str) -> Option<(String, String)> {
    let conn = db.reader();
    conn.query_row(
        "SELECT url, file_path FROM saved_webpages WHERE id = ?1",
        params![id],
        |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
    )
    .ok()
}

pub fn update_webpage_file_db(db: &Database, id: &str, file_size: i64, updated_at: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE saved_webpages SET file_size = ?1, updated_at = ?2 WHERE id = ?3",
        params![file_size, updated_at, id],
    ) {
        eprintln!("[db] update_webpage_file: {e}");
    }
}
