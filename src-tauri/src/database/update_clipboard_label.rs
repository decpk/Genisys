use rusqlite::params;
use super::Database;

pub fn update_clipboard_label_db(db: &Database, id: &str, name: &str, color: &str) -> bool {
    let conn = db.conn();

    match conn.execute(
        "UPDATE clipboard_labels SET name = ?1, color = ?2 WHERE id = ?3",
        params![name, color, id],
    ) {
        Ok(n) => n > 0,
        Err(e) => {
            eprintln!("[db] update_clipboard_label: {e}");
            false
        }
    }
}
