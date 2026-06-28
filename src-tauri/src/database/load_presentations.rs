use super::Database;
use crate::types::PresentationMeta;

pub fn load_presentations_db(db: &Database) -> Vec<PresentationMeta> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, title, description, slide_count, theme, created_at, updated_at
         FROM presentations ORDER BY updated_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_presentations: {e}");
            return vec![];
        }
    };
    stmt.query_map([], |row| {
        Ok(PresentationMeta {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            slide_count: row.get(3)?,
            theme: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
