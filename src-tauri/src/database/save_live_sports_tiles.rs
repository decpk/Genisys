use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_live_sports_tiles_db(db: &Database, tiles: &[LiveSportTile]) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        eprintln!("[db] save_live_sports_tiles begin txn: {e}"); return;
    }
    if let Err(e) = conn.execute("DELETE FROM live_sports_tiles", []) {
        eprintln!("[db] save_live_sports_tiles delete: {e}"); let _ = conn.execute_batch("ROLLBACK"); return;
    }
    let mut stmt = match conn.prepare(
        "INSERT INTO live_sports_tiles (id, query, sport_key, created_at, refresh_interval_ms, tile_width, source_url, \
         notify_on_score, notify_on_status, notify_on_period, notify_when_focused, notify_when_unfocused, auto_delete_on_end) \
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] save_live_sports_tiles prepare: {e}"); let _ = conn.execute_batch("ROLLBACK"); return; } };
    for t in tiles {
        if let Err(e) = stmt.execute(params![
            t.id, t.query, t.sport_key, t.created_at, t.refresh_interval_ms, t.tile_width, t.source_url,
            t.notify_on_score, t.notify_on_status, t.notify_on_period,
            t.notify_when_focused, t.notify_when_unfocused, t.auto_delete_on_end
        ]) {
            eprintln!("[db] save_live_sports_tiles insert: {e}");
        }
    }
    drop(stmt);
    if let Err(e) = conn.execute_batch("COMMIT") {
        eprintln!("[db] save_live_sports_tiles commit: {e}");
        let _ = conn.execute_batch("ROLLBACK");
    }
}
