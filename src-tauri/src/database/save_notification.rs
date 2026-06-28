use rusqlite::params;

use super::Database;
use crate::types::NotificationRecord;

const MAX_NOTIFICATIONS: i64 = 1000;

pub fn save_notification_db(db: &Database, n: &NotificationRecord) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO notifications (id, type, channel, source, title, message, icon, actions, meta, read, created_at, expires_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)",
        params![
            n.id,
            n.notification_type,
            n.channel,
            n.source,
            n.title,
            n.message,
            n.icon,
            n.actions,
            n.meta,
            n.read as i64,
            n.created_at,
            n.expires_at,
        ],
    ) {
        eprintln!("[db] save_notification: {e}");
        return;
    }

    // LRU cleanup — keep only the most recent MAX_NOTIFICATIONS
    if let Err(e) = conn.execute(
        "DELETE FROM notifications WHERE id NOT IN (SELECT id FROM notifications ORDER BY created_at DESC LIMIT ?1)",
        params![MAX_NOTIFICATIONS],
    ) {
        eprintln!("[db] notification LRU cleanup: {e}");
    }
}
