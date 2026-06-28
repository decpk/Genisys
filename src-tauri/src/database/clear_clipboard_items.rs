use rusqlite::params;

use super::Database;

pub fn clear_clipboard_items_db(db: &Database, include_pinned: bool) -> Vec<(Option<String>, Option<String>)> {
    let conn = db.conn();

    let (select_sql, delete_sql) = if include_pinned {
        (
            "SELECT image_path, thumbnail_path FROM clipboard_items",
            "DELETE FROM clipboard_items",
        )
    } else {
        (
            "SELECT image_path, thumbnail_path FROM clipboard_items WHERE is_pinned = 0",
            "DELETE FROM clipboard_items WHERE is_pinned = 0",
        )
    };

    let mut stmt = match conn.prepare(select_sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] clear_clipboard_items prepare select: {e}");
            return vec![];
        }
    };

    let paths: Vec<(Option<String>, Option<String>)> = stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    if let Err(e) = conn.execute(delete_sql, []) {
        eprintln!("[db] clear_clipboard_items delete: {e}");
    }

    paths
}
