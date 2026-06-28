use rusqlite::params;

use super::Database;
use crate::types::StocksTile;

pub fn save_stocks_tile_db(db: &Database, tile: Option<&StocksTile>) {
    let conn = db.conn();
    match tile {
        // Upsert by id. A blanket `DELETE FROM stocks_tile` would cascade-delete
        // the entire `stocks_watchlist` (and its news) via the ON DELETE CASCADE
        // foreign key, wiping the user's saved tickers on every tile update
        // (resize, auto-refresh toggle, …). The tile id is stable, so conflict
        // on the primary key updates the existing row in place instead.
        Some(t) => {
            if let Err(e) = conn.execute(
                "INSERT INTO stocks_tile (id, tile_width, refresh_interval_ms, auto_refresh_enabled, last_refreshed_at, created_at, updated_at) \
                 VALUES (?1,?2,?3,?4,?5,?6,?7) \
                 ON CONFLICT(id) DO UPDATE SET \
                   tile_width = excluded.tile_width, \
                   refresh_interval_ms = excluded.refresh_interval_ms, \
                   auto_refresh_enabled = excluded.auto_refresh_enabled, \
                   last_refreshed_at = excluded.last_refreshed_at, \
                   updated_at = excluded.updated_at",
                params![
                    t.id,
                    t.tile_width,
                    t.refresh_interval_ms,
                    t.auto_refresh_enabled,
                    t.last_refreshed_at,
                    t.created_at,
                    t.updated_at
                ],
            ) {
                eprintln!("[db] save_stocks_tile upsert: {e}");
            }
        }
        // `removeTile` — intentionally drop the tile and let the cascade clear
        // the watchlist + news.
        None => {
            if let Err(e) = conn.execute("DELETE FROM stocks_tile", []) {
                eprintln!("[db] save_stocks_tile delete: {e}");
            }
        }
    }
}
