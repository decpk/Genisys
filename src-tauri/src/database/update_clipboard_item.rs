use rusqlite::params;

use super::Database;

pub fn toggle_clipboard_pin_db(db: &Database, id: &str) -> bool {
    let conn = db.conn();

    if let Err(e) = conn.execute(
        "UPDATE clipboard_items SET is_pinned = NOT is_pinned WHERE id = ?1",
        params![id],
    ) {
        eprintln!("[db] toggle_clipboard_pin: {e}");
        return false;
    }

    let pinned: i64 = conn
        .query_row(
            "SELECT is_pinned FROM clipboard_items WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .unwrap_or(0);

    pinned != 0
}

pub fn update_clipboard_text_db(db: &Database, id: &str, text_content: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE clipboard_items SET text_content = ?1 WHERE id = ?2",
        params![text_content, id],
    ) {
        eprintln!("[db] update_clipboard_text: {e}");
    }
}
