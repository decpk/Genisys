use rusqlite::params;
use super::Database;

pub fn remove_label_from_clipboard_item_db(db: &Database, item_id: &str, label_id: &str) -> bool {
    let conn = db.conn();

    match conn.execute(
        "DELETE FROM clipboard_item_labels WHERE item_id = ?1 AND label_id = ?2",
        params![item_id, label_id],
    ) {
        Ok(n) => n > 0,
        Err(e) => {
            eprintln!("[db] remove_label_from_clipboard_item: {e}");
            false
        }
    }
}
