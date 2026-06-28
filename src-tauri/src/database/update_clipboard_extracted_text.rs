use rusqlite::params;

use super::Database;

pub fn update_clipboard_extracted_text_db(db: &Database, id: &str, extracted_text: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE clipboard_items SET extracted_text = ?1 WHERE id = ?2",
        params![extracted_text, id],
    ) {
        eprintln!("[db] update_clipboard_extracted_text: {e}");
    }
}
