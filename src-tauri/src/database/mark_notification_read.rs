use rusqlite::params;

use super::Database;

pub fn mark_notification_read_db(db: &Database, id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute("UPDATE notifications SET read = 1 WHERE id = ?1", params![id]) {
        eprintln!("[db] mark_notification_read: {e}");
    }
}

pub fn mark_all_notifications_read_db(db: &Database) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("UPDATE notifications SET read = 1 WHERE read = 0") {
        eprintln!("[db] mark_all_notifications_read: {e}");
    }
}
