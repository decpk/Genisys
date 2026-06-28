use super::Database;

pub fn count_clipboard_items_db(db: &Database) -> (i64, i64, i64, i64, i64) {
    let conn = db.reader();

    let total: i64 = conn
        .query_row("SELECT COUNT(*) FROM clipboard_items", [], |row| row.get(0))
        .unwrap_or(0);

    let text_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM clipboard_items WHERE content_type = 'text'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let image_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM clipboard_items WHERE content_type = 'image'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let labeled_count: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT item_id) FROM clipboard_item_labels",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let pinned_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM clipboard_items WHERE is_pinned = 1",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    (total, text_count, image_count, labeled_count, pinned_count)
}
