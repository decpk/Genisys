use rusqlite::params;
use super::Database;

pub fn add_label_to_clipboard_item_db(db: &Database, item_id: &str, label_id: &str) -> bool {
    let conn = db.conn();

    match conn.execute(
        "INSERT OR IGNORE INTO clipboard_item_labels (item_id, label_id) VALUES (?1, ?2)",
        params![item_id, label_id],
    ) {
        Ok(_) => true,
        Err(e) => {
            eprintln!("[db] add_label_to_clipboard_item: {e}");
            false
        }
    }
}
