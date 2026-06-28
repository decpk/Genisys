use rusqlite::params;

use super::Database;

pub fn remove_api_folder_db(db: &Database, folder_id: &str) {
    let conn = db.conn();
    // Soft delete: mark folder as deleted, requests get folder_id = NULL via separate update
    if let Err(e) = conn.execute(
        "UPDATE api_folders SET deleted_at = datetime('now') WHERE id = ?1",
        params![folder_id],
    ) {
        eprintln!("[db] remove_api_folder: {e}");
    }
    // Detach requests from deleted folder
    if let Err(e) = conn.execute(
        "UPDATE api_requests SET folder_id = NULL WHERE folder_id = ?1",
        params![folder_id],
    ) {
        eprintln!("[db] remove_api_folder (detach requests): {e}");
    }
}
