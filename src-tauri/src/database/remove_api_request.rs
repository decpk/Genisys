use rusqlite::params;

use super::Database;

pub fn remove_api_request_db(db: &Database, request_id: &str) {
    let conn = db.conn();
    // Soft delete: set deleted_at timestamp instead of hard delete
    if let Err(e) = conn.execute(
        "UPDATE api_requests SET deleted_at = datetime('now') WHERE id = ?1",
        params![request_id],
    ) {
        eprintln!("[db] remove_api_request: {e}");
    }
}
