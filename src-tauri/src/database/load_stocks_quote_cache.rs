use super::Database;
use crate::types::StockQuote;

pub fn load_stocks_quote_cache_db(db: &Database, symbol: &str) -> Option<StockQuote> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT symbol, price, prev_close, change_pct, day_high, day_low, day_open, volume, \
         fifty_two_week_high, fifty_two_week_low, currency, market_state, fetched_at \
         FROM stocks_quote_cache WHERE symbol = ?1 LIMIT 1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_stocks_quote_cache prepare: {e}");
            return None;
        }
    };
    stmt.query_map([symbol], |row| {
        Ok(StockQuote {
            symbol: row.get(0)?,
            price: row.get(1)?,
            prev_close: row.get(2)?,
            change_pct: row.get(3)?,
            day_high: row.get(4)?,
            day_low: row.get(5)?,
            day_open: row.get(6)?,
            volume: row.get(7)?,
            fifty_two_week_high: row.get(8)?,
            fifty_two_week_low: row.get(9)?,
            currency: row.get(10)?,
            market_state: row.get(11)?,
            fetched_at: row.get(12)?,
        })
    })
    .ok()
    .and_then(|mut rows| rows.next().and_then(|r| r.ok()))
}
