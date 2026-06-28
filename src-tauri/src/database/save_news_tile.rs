use rusqlite::params;

use super::Database;
use crate::types::NewsTile;

pub fn save_news_tile_db(db: &Database, tile: Option<&NewsTile>) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM news_tiles", []) {
        eprintln!("[db] save_news_tile delete: {e}");
        return;
    }
    if let Some(t) = tile {
        if let Err(e) = conn.execute(
            "INSERT INTO news_tiles (id, tile_width, refresh_interval_ms, last_refreshed_at, created_at, updated_at) \
             VALUES (?1,?2,?3,?4,?5,?6)",
            params![t.id, t.tile_width, t.refresh_interval_ms, t.last_refreshed_at, t.created_at, t.updated_at],
        ) {
            eprintln!("[db] save_news_tile insert: {e}");
        }
    }
}
