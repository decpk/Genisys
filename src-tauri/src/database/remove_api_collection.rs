use super::Database;

pub fn remove_api_collection_db(db: &Database, collection_id: &str) {
    let conn = db.conn();
    // Soft delete: mark collection, its folders, and requests as deleted
    if let Err(e) = conn.execute_batch(&format!(
        "UPDATE api_requests SET deleted_at = datetime('now') WHERE collection_id = '{collection_id}' AND deleted_at IS NULL;
         UPDATE api_folders SET deleted_at = datetime('now') WHERE collection_id = '{collection_id}' AND deleted_at IS NULL;
         UPDATE api_collections SET deleted_at = datetime('now') WHERE id = '{collection_id}' AND deleted_at IS NULL;"
    )) {
        eprintln!("[db] remove_api_collection: {e}");
    }
}
