use super::Database;
use crate::types::*;

pub fn load_snippets_db(db: &Database) -> Vec<Snippet> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, title, content, conversation_id, is_favorite, created_at, updated_at
         FROM snippets ORDER BY updated_at DESC",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_snippets prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| {
        let is_fav: i64 = row.get(4)?;
        Ok(Snippet {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            conversation_id: row.get(3)?,
            is_favorite: is_fav != 0,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
