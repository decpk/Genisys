use super::Database;
use crate::types::NewsTile;

pub fn load_news_tile_db(db: &Database) -> Option<NewsTile> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, tile_width, refresh_interval_ms, last_refreshed_at, created_at, updated_at \
         FROM news_tiles LIMIT 1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_news_tile prepare: {e}");
            return None;
        }
    };
    stmt.query_map([], |row| {
        Ok(NewsTile {
            id: row.get(0)?,
            tile_width: row.get(1)?,
            refresh_interval_ms: row.get(2)?,
            last_refreshed_at: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })
    .ok()
    .and_then(|mut rows| rows.next().and_then(|r| r.ok()))
}
