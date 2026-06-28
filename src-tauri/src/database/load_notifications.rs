use rusqlite::params;

use super::Database;
use crate::types::*;

const NOTIFICATIONS_PAGE_SIZE: i64 = 50;

pub fn load_notifications_db(
    db: &Database,
    before_cursor: Option<&str>,
    page_size: Option<i64>,
    filters: Option<&NotificationFilters>,
) -> NotificationPage {
    let conn = db.reader();
    let limit = page_size.unwrap_or(NOTIFICATIONS_PAGE_SIZE);
    let fetch_limit = limit + 1;

    // Build WHERE clauses dynamically
    let mut conditions: Vec<String> = Vec::new();
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut param_idx = 1;

    if let Some(cursor) = before_cursor {
        conditions.push(format!("created_at < ?{param_idx}"));
        param_values.push(Box::new(cursor.to_string()));
        param_idx += 1;
    }

    if let Some(f) = filters {
        if let Some(ref t) = f.notification_type {
            conditions.push(format!("type = ?{param_idx}"));
            param_values.push(Box::new(t.clone()));
            param_idx += 1;
        }
        if let Some(ref ch) = f.channel {
            conditions.push(format!("channel = ?{param_idx}"));
            param_values.push(Box::new(ch.clone()));
            param_idx += 1;
        }
        if let Some(ref src) = f.source {
            conditions.push(format!("source = ?{param_idx}"));
            param_values.push(Box::new(src.clone()));
            param_idx += 1;
        }
        if let Some(read) = f.read {
            conditions.push(format!("read = ?{param_idx}"));
            param_values.push(Box::new(read as i64));
            param_idx += 1;
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "SELECT id, type, channel, source, title, message, icon, actions, meta, read, created_at, expires_at
         FROM notifications {where_clause} ORDER BY created_at DESC LIMIT ?{param_idx}"
    );

    param_values.push(Box::new(fetch_limit));

    let params_refs: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();

    let mut stmt = match conn.prepare(&sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_notifications prepare: {e}");
            return NotificationPage { items: vec![], has_more: false };
        }
    };

    let mut items: Vec<NotificationRecord> = stmt
        .query_map(params_refs.as_slice(), |row| {
            let read_val: i64 = row.get(9)?;
            Ok(NotificationRecord {
                id: row.get(0)?,
                notification_type: row.get(1)?,
                channel: row.get(2)?,
                source: row.get(3)?,
                title: row.get(4)?,
                message: row.get(5)?,
                icon: row.get(6)?,
                actions: row.get(7)?,
                meta: row.get(8)?,
                read: read_val != 0,
                created_at: row.get(10)?,
                expires_at: row.get(11)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    let has_more = items.len() as i64 > limit;
    if has_more {
        items.pop();
    }

    NotificationPage { items, has_more }
}
