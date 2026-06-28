use super::{mock_load_request_logs_db, Database};

/// Export all persisted request logs for a server as a single JSON array
/// string (newest first). Returns "[]" if serialization fails.
pub fn mock_export_request_logs_db(db: &Database, server_id: &str) -> String {
    let logs = mock_load_request_logs_db(db, server_id, None, None, None, Some(5000));
    serde_json::to_string(&logs).unwrap_or_else(|_| "[]".to_string())
}
