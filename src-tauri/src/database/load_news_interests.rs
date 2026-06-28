use super::Database;
use crate::types::NewsInterest;

pub fn load_news_interests_db(db: &Database, tile_id: &str) -> Vec<NewsInterest> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, tile_id, category_key, label, custom_prompt, resolved_url, position, last_refreshed_at, created_at \
         FROM news_interests WHERE tile_id = ?1 ORDER BY position ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_news_interests prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([tile_id], |row| {
        Ok(NewsInterest {
            id: row.get(0)?,
            tile_id: row.get(1)?,
            category_key: row.get(2)?,
            label: row.get(3)?,
            custom_prompt: row.get(4)?,
            resolved_url: row.get(5)?,
            position: row.get(6)?,
            last_refreshed_at: row.get(7)?,
            created_at: row.get(8)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
