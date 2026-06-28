use rusqlite::params;

use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;

use super::Database;
use crate::types::{ClipboardItem, ClipboardLabel};

pub fn fuzzy_search_clipboard_items_db(
    db: &Database,
    query: &str,
    limit: i64,
    offset: i64,
    content_type: Option<&str>,
) -> (Vec<ClipboardItem>, bool) {
    let conn = db.reader();

    // Build conditions and params for the lightweight candidate query
    let mut conditions: Vec<String> = Vec::new();
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut param_idx = 1;

    if let Some(ct) = content_type {
        if ct == "pinned" {
            conditions.push("ci.is_pinned = 1".to_string());
        } else if ct == "labeled" {
            conditions.push(
                "EXISTS (SELECT 1 FROM clipboard_item_labels WHERE item_id = ci.id)".to_string(),
            );
        } else if ct.starts_with("label:") {
            let label_id = &ct[6..];
            conditions.push(format!(
                "EXISTS (SELECT 1 FROM clipboard_item_labels WHERE item_id = ci.id AND label_id = ?{param_idx})"
            ));
            param_values.push(Box::new(label_id.to_string()));
            param_idx += 1;
        } else {
            conditions.push(format!("ci.content_type = ?{param_idx}"));
            param_values.push(Box::new(ct.to_string()));
            param_idx += 1;
        }
    }

    let _ = param_idx;

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    // Load all candidate IDs with text_content and image_description for scoring
    let candidate_sql = format!(
        "SELECT ci.id, ci.text_content, ci.image_description
         FROM clipboard_items ci {where_clause}"
    );

    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        param_values.iter().map(|p| p.as_ref()).collect();

    let mut stmt = match conn.prepare(&candidate_sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] fuzzy_search_clipboard prepare candidates: {e}");
            return (vec![], false);
        }
    };

    let candidates: Vec<(String, Option<String>, Option<String>)> = stmt
        .query_map(params_refs.as_slice(), |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    // Score each candidate using fuzzy matching
    let matcher = SkimMatcherV2::default();
    let mut scored: Vec<(String, i64)> = Vec::new();

    for (id, text_content, image_description) in &candidates {
        let text_score = text_content
            .as_deref()
            .and_then(|t| matcher.fuzzy_match(t, query));
        let desc_score = image_description
            .as_deref()
            .and_then(|d| matcher.fuzzy_match(d, query));

        let max_score = match (text_score, desc_score) {
            (Some(a), Some(b)) => Some(a.max(b)),
            (Some(a), None) => Some(a),
            (None, Some(b)) => Some(b),
            (None, None) => None,
        };

        if let Some(score) = max_score {
            scored.push((id.clone(), score));
        }
    }

    // Sort by score descending (best matches first)
    scored.sort_by(|a, b| b.1.cmp(&a.1));

    // Apply offset/limit pagination
    let fetch_limit = (limit + 1) as usize;
    let offset_usize = offset as usize;
    let paginated: Vec<&(String, i64)> = scored.iter().skip(offset_usize).take(fetch_limit).collect();

    let has_more = paginated.len() as i64 > limit;
    let result_ids: Vec<&str> = paginated
        .iter()
        .take(limit as usize)
        .map(|(id, _)| id.as_str())
        .collect();

    if result_ids.is_empty() {
        return (vec![], false);
    }

    // Build a map of id -> position for restoring score order
    let id_order: std::collections::HashMap<&str, usize> = result_ids
        .iter()
        .enumerate()
        .map(|(i, id)| (*id, i))
        .collect();

    // Load full item data for the matched IDs
    let placeholders: Vec<String> = (1..=result_ids.len())
        .map(|i| format!("?{i}"))
        .collect();
    let placeholders_str = placeholders.join(", ");

    let item_sql = format!(
        "SELECT ci.id, ci.content_type, ci.text_content, ci.image_path, ci.thumbnail_path, ci.is_pinned, ci.created_at, ci.content_hash, ci.byte_size, ci.image_description, ci.analysis_status, ci.extracted_text, ci.smart_categories, ci.sensitivity_level, ci.sensitivity_matches
         FROM clipboard_items ci
         WHERE ci.id IN ({placeholders_str})"
    );

    let id_params: Vec<Box<dyn rusqlite::types::ToSql>> = result_ids
        .iter()
        .map(|id| Box::new(id.to_string()) as Box<dyn rusqlite::types::ToSql>)
        .collect();
    let id_params_refs: Vec<&dyn rusqlite::types::ToSql> =
        id_params.iter().map(|p| p.as_ref()).collect();

    let mut item_stmt = match conn.prepare(&item_sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] fuzzy_search_clipboard prepare items: {e}");
            return (vec![], false);
        }
    };

    let mut items: Vec<ClipboardItem> = item_stmt
        .query_map(id_params_refs.as_slice(), |row| {
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

    // Sort items back into score order
    items.sort_by_key(|item| {
        id_order.get(item.id.as_str()).copied().unwrap_or(usize::MAX)
    });

    // Load labels for each item
    let mut label_stmt = match conn.prepare(
        "SELECT l.id, l.name, l.color, l.created_at
         FROM clipboard_labels l
         INNER JOIN clipboard_item_labels il ON il.label_id = l.id
         WHERE il.item_id = ?1
         ORDER BY l.created_at ASC",
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
