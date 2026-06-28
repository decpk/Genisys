use rusqlite::params;

use super::Database;

/// Delete all persisted request logs for a given server. Returns an error
/// string on failure.
pub fn mock_clear_request_logs_db(db: &Database, server_id: &str) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "DELETE FROM mock_request_logs WHERE server_id = ?1",
        params![server_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
