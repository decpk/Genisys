use rusqlite::params;

use super::Database;

pub fn search_note_titles_db(db: &Database, app_id: &str, query: &str) -> Vec<(String, String)> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, title FROM notes
         WHERE app_id=?1 AND title LIKE '%'||?2||'%'
         ORDER BY updated_at DESC LIMIT 20",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] search_note_titles prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map(params![app_id, query], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
