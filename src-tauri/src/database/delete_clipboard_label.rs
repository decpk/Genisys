use rusqlite::params;
use super::Database;

pub fn count_items_with_label_db(db: &Database, label_id: &str) -> i64 {
    let conn = db.reader();
    conn.query_row(
        "SELECT COUNT(*) FROM clipboard_item_labels WHERE label_id = ?1",
        params![label_id],
        |row| row.get(0),
    )
    .unwrap_or(0)
}

pub fn delete_clipboard_label_db(db: &Database, label_id: &str) -> bool {
    let conn = db.conn();

    // Delete junction table entries first
    if let Err(e) = conn.execute(
        "DELETE FROM clipboard_item_labels WHERE label_id = ?1",
        params![label_id],
    ) {
        eprintln!("[db] delete_clipboard_label junction: {e}");
        return false;
    }

    // Delete the label itself
    match conn.execute(
        "DELETE FROM clipboard_labels WHERE id = ?1",
        params![label_id],
    ) {
        Ok(n) => n > 0,
        Err(e) => {
            eprintln!("[db] delete_clipboard_label: {e}");
            false
        }
    }
}
