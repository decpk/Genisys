use rusqlite::params;

use super::Database;
use crate::types::StockQuote;

pub fn save_stocks_quote_cache_db(db: &Database, quote: &StockQuote) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO stocks_quote_cache \
         (symbol, price, prev_close, change_pct, day_high, day_low, day_open, volume, \
          fifty_two_week_high, fifty_two_week_low, currency, market_state, fetched_at) \
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13) \
         ON CONFLICT(symbol) DO UPDATE SET \
            price = excluded.price, \
            prev_close = excluded.prev_close, \
            change_pct = excluded.change_pct, \
            day_high = excluded.day_high, \
            day_low = excluded.day_low, \
            day_open = excluded.day_open, \
            volume = excluded.volume, \
            fifty_two_week_high = excluded.fifty_two_week_high, \
            fifty_two_week_low = excluded.fifty_two_week_low, \
            currency = excluded.currency, \
            market_state = excluded.market_state, \
            fetched_at = excluded.fetched_at",
        params![
            quote.symbol,
            quote.price,
            quote.prev_close,
            quote.change_pct,
            quote.day_high,
            quote.day_low,
            quote.day_open,
            quote.volume,
            quote.fifty_two_week_high,
            quote.fifty_two_week_low,
            quote.currency,
            quote.market_state,
            quote.fetched_at,
        ],
    ) {
        eprintln!("[db] save_stocks_quote_cache: {e}");
    }
}
