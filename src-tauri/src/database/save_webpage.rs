use rusqlite::params;

use super::Database;
use crate::types::SavedWebpage;

pub fn save_webpage_db(db: &Database, webpage: &SavedWebpage) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO saved_webpages (id, name, url, file_path, file_size, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            url = excluded.url,
            file_path = excluded.file_path,
            file_size = excluded.file_size,
            updated_at = excluded.updated_at",
        params![
            webpage.id,
            webpage.name,
            webpage.url,
            webpage.file_path,
            webpage.file_size,
            webpage.created_at,
            webpage.updated_at
        ],
    ) {
        eprintln!("[db] save_webpage: {e}");
    }
}
