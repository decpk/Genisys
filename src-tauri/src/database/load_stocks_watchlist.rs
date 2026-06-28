use super::Database;
use crate::types::StockWatchItem;

pub fn load_stocks_watchlist_db(db: &Database, tile_id: &str) -> Vec<StockWatchItem> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, tile_id, symbol, short_name, long_name, exchange, quote_type, \
         custom_news_url, custom_price_url, alert_above, alert_below, alert_enabled, \
         position, last_refreshed_at, created_at \
         FROM stocks_watchlist WHERE tile_id = ?1 ORDER BY position ASC, created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_stocks_watchlist prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([tile_id], |row| {
        Ok(StockWatchItem {
            id: row.get(0)?,
            tile_id: row.get(1)?,
            symbol: row.get(2)?,
            short_name: row.get(3)?,
            long_name: row.get(4)?,
            exchange: row.get(5)?,
            quote_type: row.get(6)?,
            custom_news_url: row.get(7)?,
            custom_price_url: row.get(8)?,
            alert_above: row.get(9)?,
            alert_below: row.get(10)?,
            alert_enabled: row.get(11)?,
            position: row.get(12)?,
            last_refreshed_at: row.get(13)?,
            created_at: row.get(14)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
