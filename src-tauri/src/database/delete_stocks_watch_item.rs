use rusqlite::params;

use super::Database;

pub fn delete_stocks_watch_item_db(db: &Database, item_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM stocks_watchlist WHERE id = ?1",
        params![item_id],
    ) {
        eprintln!("[db] delete_stocks_watch_item: {e}");
    }
}
