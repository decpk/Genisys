use rusqlite::params;

use super::Database;

pub fn prune_clipboard_items_db(db: &Database, max_items: i64) -> Vec<(Option<String>, Option<String>)> {
    let conn = db.conn();

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM clipboard_items", [], |row| row.get(0))
        .unwrap_or(0);

    if count <= max_items {
        return vec![];
    }

    let excess = count - max_items;

    // Collect paths for file cleanup
    let mut stmt = match conn.prepare(
        "SELECT image_path, thumbnail_path FROM clipboard_items
         WHERE is_pinned = 0 ORDER BY created_at ASC LIMIT ?1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] prune_clipboard_items prepare select: {e}");
            return vec![];
        }
    };

    let paths: Vec<(Option<String>, Option<String>)> = stmt
        .query_map(params![excess], |row| Ok((row.get(0)?, row.get(1)?)))
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    if let Err(e) = conn.execute(
        "DELETE FROM clipboard_items WHERE id IN (
            SELECT id FROM clipboard_items WHERE is_pinned = 0 ORDER BY created_at ASC LIMIT ?1
        )",
        params![excess],
    ) {
        eprintln!("[db] prune_clipboard_items delete: {e}");
    }

    paths
}
