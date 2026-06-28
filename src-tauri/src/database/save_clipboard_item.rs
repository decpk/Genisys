use rusqlite::params;

use super::Database;
use crate::types::ClipboardItem;

pub fn save_clipboard_item_db(db: &Database, item: &ClipboardItem) -> bool {
    let conn = db.conn();

    // Check if the latest item has the same content_hash (dedup)
    let latest_hash: Option<String> = conn
        .query_row(
            "SELECT content_hash FROM clipboard_items ORDER BY created_at DESC LIMIT 1",
            [],
            |row| row.get(0),
        )
        .ok();

    if let Some(hash) = latest_hash {
        if hash == item.content_hash {
            return false;
        }
    }

    let smart_categories_json =
        serde_json::to_string(&item.smart_categories).unwrap_or_else(|_| "[]".to_string());
    let sensitivity_matches_json =
        serde_json::to_string(&item.sensitivity_matches).unwrap_or_else(|_| "[]".to_string());

    if let Err(e) = conn.execute(
        "INSERT INTO clipboard_items (id, content_type, text_content, image_path, thumbnail_path, is_pinned, created_at, content_hash, byte_size, image_description, analysis_status, extracted_text, smart_categories, sensitivity_level, sensitivity_matches)
         VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
        params![
            item.id,
            item.content_type,
            item.text_content,
            item.image_path,
            item.thumbnail_path,
            item.created_at,
            item.content_hash,
            item.byte_size,
            item.image_description,
            item.analysis_status,
            item.extracted_text,
            smart_categories_json,
            item.sensitivity_level,
            sensitivity_matches_json,
        ],
    ) {
        eprintln!("[db] save_clipboard_item: {e}");
        return false;
    }

    true
}
