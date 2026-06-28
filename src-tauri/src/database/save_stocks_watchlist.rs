use rusqlite::params;

use super::Database;
use crate::types::StockWatchItem;

pub fn save_stocks_watchlist_db(db: &Database, tile_id: &str, items: &[StockWatchItem]) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        eprintln!("[db] save_stocks_watchlist begin txn: {e}");
        return;
    }
    if let Err(e) = conn.execute(
        "DELETE FROM stocks_watchlist WHERE tile_id = ?1",
        params![tile_id],
    ) {
        eprintln!("[db] save_stocks_watchlist delete: {e}");
        let _ = conn.execute_batch("ROLLBACK");
        return;
    }
    let mut stmt = match conn.prepare(
        "INSERT INTO stocks_watchlist \
         (id, tile_id, symbol, short_name, long_name, exchange, quote_type, \
          custom_news_url, custom_price_url, alert_above, alert_below, alert_enabled, \
          position, last_refreshed_at, created_at) \
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] save_stocks_watchlist prepare: {e}");
            let _ = conn.execute_batch("ROLLBACK");
            return;
        }
    };
    for it in items {
        if let Err(e) = stmt.execute(params![
            it.id,
            it.tile_id,
            it.symbol,
            it.short_name,
            it.long_name,
            it.exchange,
            it.quote_type,
            it.custom_news_url,
            it.custom_price_url,
            it.alert_above,
            it.alert_below,
            it.alert_enabled,
            it.position,
            it.last_refreshed_at,
            it.created_at,
        ]) {
            eprintln!("[db] save_stocks_watchlist insert: {e}");
        }
    }
    drop(stmt);
    if let Err(e) = conn.execute_batch("COMMIT") {
        eprintln!("[db] save_stocks_watchlist commit: {e}");
        let _ = conn.execute_batch("ROLLBACK");
    }
}
