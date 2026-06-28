use super::Database;
use crate::types::SavedWebpage;

pub fn load_webpages_db(db: &Database) -> Vec<SavedWebpage> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, url, file_path, file_size, created_at, updated_at
         FROM saved_webpages ORDER BY created_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_webpages: {e}");
            return vec![];
        }
    };
    stmt.query_map([], |row| {
        Ok(SavedWebpage {
            id: row.get(0)?,
            name: row.get(1)?,
            url: row.get(2)?,
            file_path: row.get(3)?,
            file_size: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
