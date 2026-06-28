use super::Database;
use crate::types::StocksTile;

pub fn load_stocks_tile_db(db: &Database) -> Option<StocksTile> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, tile_width, refresh_interval_ms, auto_refresh_enabled, last_refreshed_at, created_at, updated_at \
         FROM stocks_tile LIMIT 1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_stocks_tile prepare: {e}");
            return None;
        }
    };
    stmt.query_map([], |row| {
        Ok(StocksTile {
            id: row.get(0)?,
            tile_width: row.get(1)?,
            refresh_interval_ms: row.get(2)?,
            auto_refresh_enabled: row.get(3)?,
            last_refreshed_at: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })
    .ok()
    .and_then(|mut rows| rows.next().and_then(|r| r.ok()))
}
