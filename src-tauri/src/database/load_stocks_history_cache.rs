use super::Database;
use crate::types::StockHistoryPoint;

pub struct CachedStockHistory {
    pub points: Vec<StockHistoryPoint>,
    pub fetched_at: String,
}

pub fn load_stocks_history_cache_db(
    db: &Database,
    symbol: &str,
    range_key: &str,
) -> Option<CachedStockHistory> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT points_json, fetched_at FROM stocks_history_cache \
         WHERE symbol = ?1 AND range_key = ?2 LIMIT 1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_stocks_history_cache prepare: {e}");
            return None;
        }
    };
    let row = stmt
        .query_map([symbol, range_key], |row| {
            let json: String = row.get(0)?;
            let fetched_at: String = row.get(1)?;
            Ok((json, fetched_at))
        })
        .ok()
        .and_then(|mut rows| rows.next().and_then(|r| r.ok()));

    let (json, fetched_at) = row?;
    match serde_json::from_str::<Vec<StockHistoryPoint>>(&json) {
        Ok(points) => Some(CachedStockHistory { points, fetched_at }),
        Err(e) => {
            eprintln!("[db] load_stocks_history_cache parse: {e}");
            None
        }
    }
}
