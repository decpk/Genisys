use rusqlite::params;

use super::Database;
use crate::types::StockHistoryPoint;

pub fn save_stocks_history_cache_db(
    db: &Database,
    symbol: &str,
    range_key: &str,
    points: &[StockHistoryPoint],
    fetched_at: &str,
) {
    let conn = db.conn();
    let points_json = match serde_json::to_string(points) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] save_stocks_history_cache serialize: {e}");
            return;
        }
    };
    if let Err(e) = conn.execute(
        "INSERT INTO stocks_history_cache (symbol, range_key, points_json, fetched_at) \
         VALUES (?1, ?2, ?3, ?4) \
         ON CONFLICT(symbol, range_key) DO UPDATE SET \
            points_json = excluded.points_json, \
            fetched_at = excluded.fetched_at",
        params![symbol, range_key, points_json, fetched_at],
    ) {
        eprintln!("[db] save_stocks_history_cache: {e}");
    }
}
