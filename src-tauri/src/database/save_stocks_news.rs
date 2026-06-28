use rusqlite::params;

use super::Database;
use crate::types::StockNewsItem;

pub fn save_stocks_news_db(db: &Database, watchlist_id: &str, items: &[StockNewsItem]) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        eprintln!("[db] save_stocks_news begin txn: {e}");
        return;
    }
    if let Err(e) = conn.execute(
        "DELETE FROM stocks_news WHERE watchlist_id = ?1",
        params![watchlist_id],
    ) {
        eprintln!("[db] save_stocks_news delete: {e}");
        let _ = conn.execute_batch("ROLLBACK");
        return;
    }
    let mut stmt = match conn.prepare(
        "INSERT OR IGNORE INTO stocks_news \
         (id, watchlist_id, source_type, title, summary, why_it_matters, url, \
          publisher, published_at, fetched_at, raw_hash) \
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] save_stocks_news prepare: {e}");
            let _ = conn.execute_batch("ROLLBACK");
            return;
        }
    };
    for n in items {
        if let Err(e) = stmt.execute(params![
            n.id,
            n.watchlist_id,
            n.source_type,
            n.title,
            n.summary,
            n.why_it_matters,
            n.url,
            n.publisher,
            n.published_at,
            n.fetched_at,
            n.raw_hash,
        ]) {
            eprintln!("[db] save_stocks_news insert: {e}");
        }
    }
    drop(stmt);
    if let Err(e) = conn.execute_batch("COMMIT") {
        eprintln!("[db] save_stocks_news commit: {e}");
        let _ = conn.execute_batch("ROLLBACK");
    }
}
