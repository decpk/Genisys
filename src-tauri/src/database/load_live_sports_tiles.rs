use super::Database;
use crate::types::*;

pub fn load_live_sports_tiles_db(db: &Database) -> Vec<LiveSportTile> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, query, sport_key, created_at, refresh_interval_ms, tile_width, source_url, \
         notify_on_score, notify_on_status, notify_on_period, notify_when_focused, notify_when_unfocused, auto_delete_on_end \
         FROM live_sports_tiles"
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_live_sports_tiles prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| {
        Ok(LiveSportTile {
            id: row.get(0)?, query: row.get(1)?, sport_key: row.get(2)?,
            created_at: row.get(3)?, refresh_interval_ms: row.get(4)?, tile_width: row.get(5)?,
            source_url: row.get(6)?,
            notify_on_score: row.get(7)?,
            notify_on_status: row.get(8)?,
            notify_on_period: row.get(9)?,
            notify_when_focused: row.get(10)?,
            notify_when_unfocused: row.get(11)?,
            auto_delete_on_end: row.get(12)?,
        })
    }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
