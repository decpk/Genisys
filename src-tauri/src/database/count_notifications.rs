use super::Database;

pub fn count_unread_notifications_db(db: &Database) -> i64 {
    let conn = db.reader();
    conn.query_row(
        "SELECT COUNT(*) FROM notifications WHERE read = 0",
        [],
        |row| row.get(0),
    )
    .unwrap_or(0)
}
