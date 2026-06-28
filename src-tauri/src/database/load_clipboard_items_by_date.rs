use rusqlite::params;

use super::Database;
use crate::types::{ClipboardItem, ClipboardLabel};

pub fn load_clipboard_items_by_date_db(db: &Database, date: &str) -> Vec<ClipboardItem> {
    let conn = db.reader();

    let sql = "SELECT ci.id, ci.content_type, ci.text_content, ci.image_path, ci.thumbnail_path,
                      ci.is_pinned, ci.created_at, ci.content_hash, ci.byte_size,
                      ci.image_description, ci.analysis_status, ci.extracted_text,
                      ci.smart_categories, ci.sensitivity_level, ci.sensitivity_matches
               FROM clipboard_items ci
               WHERE date(ci.created_at, 'localtime') = ?1
               ORDER BY ci.created_at DESC";

    let mut stmt = match conn.prepare(sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_clipboard_items_by_date prepare: {e}");
            return vec![];
        }
    };

    let mut items: Vec<ClipboardItem> = stmt
        .query_map(params![date], |row| {
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
                analysis_status: row
                    .get::<_, Option<String>>(10)?
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
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    // Load labels for each item
    let mut label_stmt = match conn.prepare(
        "SELECT l.id, l.name, l.color, l.created_at
         FROM clipboard_labels l
         INNER JOIN clipboard_item_labels il ON il.label_id = l.id
         WHERE il.item_id = ?1
         ORDER BY l.created_at ASC",
    ) {
        Ok(s) => s,
        Err(_) => return items,
    };

    for item in &mut items {
        let labels: Vec<ClipboardLabel> = label_stmt
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
        item.labels = labels;
    }

    items
}
