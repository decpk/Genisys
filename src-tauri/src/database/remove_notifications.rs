use rusqlite::params;

use super::Database;

pub fn remove_notification_db(db: &Database, id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM notifications WHERE id = ?1", params![id]) {
        eprintln!("[db] remove_notification: {e}");
    }
}

pub fn remove_all_notifications_db(db: &Database) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("DELETE FROM notifications") {
        eprintln!("[db] remove_all_notifications: {e}");
    }
}
