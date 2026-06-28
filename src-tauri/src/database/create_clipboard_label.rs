use rusqlite::params;
use super::Database;

pub fn create_clipboard_label_db(db: &Database, id: &str, name: &str, color: &str) -> bool {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();

    if let Err(e) = conn.execute(
        "INSERT INTO clipboard_labels (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, name, color, now],
    ) {
        eprintln!("[db] create_clipboard_label: {e}");
        return false;
    }

    true
}
