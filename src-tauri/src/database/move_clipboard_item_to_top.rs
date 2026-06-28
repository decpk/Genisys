use chrono::Utc;
use rusqlite::params;

use super::Database;
use crate::types::{ClipboardItem, ClipboardLabel};

/// If an item with the given `content_hash` exists anywhere in history,
/// update its `created_at` to now (moving it to the top) and return it
/// with its labels. Returns `None` if no match is found.
pub fn move_clipboard_item_to_top_db(db: &Database, content_hash: &str) -> Option<ClipboardItem> {
    let conn = db.conn();

    // Find existing item by content_hash
    let mut item: ClipboardItem = conn
        .query_row(
            "SELECT id, content_type, text_content, image_path, thumbnail_path,
                    is_pinned, created_at, content_hash, byte_size,
                    image_description, analysis_status, extracted_text,
                    smart_categories, sensitivity_level, sensitivity_matches
             FROM clipboard_items
             WHERE content_hash = ?1
             LIMIT 1",
            params![content_hash],
            |row| {
                let pinned_val: i64 = row.get(5)?;
                Ok(ClipboardItem {
                    id: row.get(0)?,
                    content_type: row.get(1)?,
                    text_content: row.get(2)?,
                    image_path: row.get(3)?,
                    thumbnail_path: row.get(4)?,
                    is_pinned: pinned_val != 0,
                    created_at: row.get(6)?,
                    content_hash: row.get(7)?,
                    byte_size: row.get(8)?,
                    labels: vec![],
                    image_description: row.get(9)?,
                    analysis_status: row.get::<_, Option<String>>(10)?
                        .unwrap_or_else(|| "none".to_string()),
                    extracted_text: row.get(11)?,
                    smart_categories: row
                        .get::<_, Option<String>>(12)?
                        .and_then(|s| serde_json::from_str(&s).ok())
                        .unwrap_or_default(),
                    sensitivity_level: row
                        .get::<_, Option<String>>(13)?
                        .unwrap_or_else(|| "none".to_string()),
                    sensitivity_matches: row
                        .get::<_, Option<String>>(14)?
                        .and_then(|s| serde_json::from_str(&s).ok())
                        .unwrap_or_default(),
                })
            },
        )
        .ok()?;

    // Update created_at to now
    let new_created_at = Utc::now().to_rfc3339();
    if let Err(e) = conn.execute(
        "UPDATE clipboard_items SET created_at = ?1 WHERE id = ?2",
        params![new_created_at, item.id],
    ) {
        eprintln!("[db] move_clipboard_item_to_top update: {e}");
        return None;
    }
    item.created_at = new_created_at;

    // Load labels for the item
    if let Ok(mut label_stmt) = conn.prepare(
        "SELECT l.id, l.name, l.color, l.created_at
         FROM clipboard_labels l
         INNER JOIN clipboard_item_labels il ON il.label_id = l.id
         WHERE il.item_id = ?1
         ORDER BY l.created_at ASC",
    ) {
        item.labels = label_stmt
            .query_map(params![item.id], |row| {
                Ok(ClipboardLabel {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
            .unwrap_or_default();
    }

    Some(item)
}
