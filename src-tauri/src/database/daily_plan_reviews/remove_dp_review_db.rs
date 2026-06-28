use rusqlite::params;

use crate::database::Database;

/// Deletes a single daily-plan review row by id.
pub fn remove_dp_review_db(db: &Database, id: &str) {
    let conn = db.conn();
    conn.execute("DELETE FROM dp_reviews WHERE id = ?1", params![id])
        .map_err(|e| eprintln!("[db] remove_dp_review: {e}"))
        .ok();
}
