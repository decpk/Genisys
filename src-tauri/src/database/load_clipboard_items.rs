use rusqlite::params;

use super::Database;
use crate::types::{ClipboardItem, ClipboardLabel};

pub fn load_clipboard_items_db(
    db: &Database,
    cursor: Option<&str>,
    limit: i64,
    content_type: Option<&str>,
    search: Option<&str>,
) -> (Vec<ClipboardItem>, bool) {
    let conn = db.reader();
    let fetch_limit = limit + 1;

    let mut conditions: Vec<String> = Vec::new();
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut param_idx = 1;
    let mut use_fts = false;

    if let Some(c) = cursor {
        conditions.push(format!("ci.created_at < ?{param_idx}"));
        param_values.push(Box::new(c.to_string()));
        param_idx += 1;
    }

    if let Some(ct) = content_type {
        if ct == "pinned" {
            conditions.push("ci.is_pinned = 1".to_string());
        } else if ct == "labeled" {
            conditions.push("EXISTS (SELECT 1 FROM clipboard_item_labels WHERE item_id = ci.id)".to_string());
        } else if ct.starts_with("label:") {
            let label_id = &ct[6..];
            conditions.push(format!("EXISTS (SELECT 1 FROM clipboard_item_labels WHERE item_id = ci.id AND label_id = ?{param_idx})"));
            param_values.push(Box::new(label_id.to_string()));
            param_idx += 1;
        } else {
            conditions.push(format!("ci.content_type = ?{param_idx}"));
            param_values.push(Box::new(ct.to_string()));
            param_idx += 1;
        }
    }

    if let Some(s) = search {
        if !s.is_empty() {
            // Use FTS5 for full-text search across text_content and image_description
            // Tokenize the query: split into words, append * for prefix matching
            let fts_query = s
                .split_whitespace()
                .map(|w| {
                    // Escape double quotes in tokens
                    let escaped = w.replace('"', "\"\"");
                    format!("\"{escaped}\"*")
                })
                .collect::<Vec<_>>()
                .join(" ");
            conditions.push(format!(
                "ci.id IN (SELECT item_id FROM clipboard_fts WHERE clipboard_fts MATCH ?{param_idx})"
            ));
            param_values.push(Box::new(fts_query));
            param_idx += 1;
            use_fts = true;
        }
    }
    let _ = use_fts;

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "SELECT ci.id, ci.content_type, ci.text_content, ci.image_path, ci.thumbnail_path, ci.is_pinned, ci.created_at, ci.content_hash, ci.byte_size, ci.image_description, ci.analysis_status, ci.extracted_text, ci.smart_categories, ci.sensitivity_level, ci.sensitivity_matches
         FROM clipboard_items ci {where_clause}
         ORDER BY ci.created_at DESC
         LIMIT ?{param_idx}"
    );

    param_values.push(Box::new(fetch_limit));

    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        param_values.iter().map(|p| p.as_ref()).collect();

    let mut stmt = match conn.prepare(&sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_clipboard_items prepare: {e}");
            return (vec![], false);
        }
    };

    let mut items: Vec<ClipboardItem> = stmt
        .query_map(params_refs.as_slice(), |row| {
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
                analysis_status: row.get::<_, Option<String>>(10)?.unwrap_or_else(|| "none".to_string()),
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

    let has_more = items.len() as i64 > limit;
    if has_more {
        items.pop();
    }

    // Load labels for each item
    let mut label_stmt = match conn.prepare(
        "SELECT l.id, l.name, l.color, l.created_at
         FROM clipboard_labels l
         INNER JOIN clipboard_item_labels il ON il.label_id = l.id
         WHERE il.item_id = ?1
         ORDER BY l.created_at ASC"
    ) {
        Ok(s) => s,
        Err(_) => return (items, has_more),
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

    (items, has_more)
}
