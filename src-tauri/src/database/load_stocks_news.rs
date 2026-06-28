use super::Database;
use crate::types::StockNewsItem;

pub fn load_stocks_news_db(db: &Database, watchlist_id: &str) -> Vec<StockNewsItem> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, watchlist_id, source_type, title, summary, why_it_matters, url, \
         publisher, published_at, fetched_at, raw_hash \
         FROM stocks_news WHERE watchlist_id = ?1 \
         ORDER BY COALESCE(published_at, fetched_at) DESC LIMIT 25",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_stocks_news prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([watchlist_id], |row| {
        Ok(StockNewsItem {
            id: row.get(0)?,
            watchlist_id: row.get(1)?,
            source_type: row.get(2)?,
            title: row.get(3)?,
            summary: row.get(4)?,
            why_it_matters: row.get(5)?,
            url: row.get(6)?,
            publisher: row.get(7)?,
            published_at: row.get(8)?,
            fetched_at: row.get(9)?,
            raw_hash: row.get(10)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
