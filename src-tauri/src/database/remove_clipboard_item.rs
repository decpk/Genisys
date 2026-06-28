use rusqlite::params;

use super::Database;

pub fn remove_clipboard_item_db(db: &Database, id: &str) -> Option<(Option<String>, Option<String>)> {
    let conn = db.conn();

    let paths: Option<(Option<String>, Option<String>)> = conn
        .query_row(
            "SELECT image_path, thumbnail_path FROM clipboard_items WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .ok();

    if let Err(e) = conn.execute("DELETE FROM clipboard_items WHERE id = ?1", params![id]) {
        eprintln!("[db] remove_clipboard_item: {e}");
        return None;
    }

    paths
}
