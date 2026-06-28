use super::Database;
use crate::types::BookMeta;

pub fn load_books_db(db: &Database) -> Vec<BookMeta> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, title, description, status, chapter_count, model, language, generation_duration_ms, created_at, updated_at
         FROM books ORDER BY updated_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_books: {e}");
            return vec![];
        }
    };
    stmt.query_map([], |row| {
        Ok(BookMeta {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            status: row.get(3)?,
            chapter_count: row.get(4)?,
            model: row.get(5)?,
            language: row.get(6)?,
            generation_duration_ms: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
