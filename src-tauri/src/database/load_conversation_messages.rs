use rusqlite::params;

use super::Database;
use crate::types::*;

/// Parse the stored `images` JSON array string into a `Vec<String>` of filenames.
/// Returns `None` for null/empty/invalid values so the field is omitted.
fn parse_images(raw: Option<String>) -> Option<Vec<String>> {
    let raw = raw?;
    if raw.trim().is_empty() {
        return None;
    }
    match serde_json::from_str::<Vec<String>>(&raw) {
        Ok(v) if !v.is_empty() => Some(v),
        _ => None,
    }
}

/// Load messages for a conversation with cursor-based pagination.
/// - `before_sort_order`: if provided, load messages with sort_order < this value (older messages)
/// - `limit`: max number of messages to return
/// Messages are returned in ascending sort_order (oldest first within the page).
pub fn load_conversation_messages_db(
    db: &Database,
    conversation_id: &str,
    before_sort_order: Option<i64>,
    limit: i64,
) -> ChatMessagesPage {
    let conn = db.reader();
    // Fetch limit+1 to check if there are more messages
    let fetch_limit = limit + 1;
    let mut messages: Vec<ChatMessage> = match before_sort_order {
        Some(cursor) => {
            let mut stmt = match conn.prepare(
                "SELECT id, role, content, timestamp, sort_order, reasoning, activities_json, context_mode, images FROM chat_messages
                 WHERE conversation_id = ?1 AND sort_order < ?2
                 ORDER BY sort_order DESC LIMIT ?3",
            ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_conv_messages prepare: {e}"); return ChatMessagesPage { messages: vec![], has_more: false }; } };
            stmt.query_map(params![conversation_id, cursor, fetch_limit], |row| {
                Ok(ChatMessage {
                    id: row.get(0)?,
                    role: row.get(1)?,
                    content: row.get(2)?,
                    timestamp: row.get(3)?,
                    sort_order: Some(row.get(4)?),
                    reasoning: row.get(5).ok(),
                    activities_json: row.get(6).ok(),
                    context_mode: row.get(7).ok().flatten(),
                    images: parse_images(row.get::<_, Option<String>>(8).ok().flatten()),
                })
            }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
        }
        None => {
            // No cursor = load the most recent messages
            let mut stmt = match conn.prepare(
                "SELECT id, role, content, timestamp, sort_order, reasoning, activities_json, context_mode, images FROM chat_messages
                 WHERE conversation_id = ?1
                 ORDER BY sort_order DESC LIMIT ?2",
            ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_conv_messages prepare: {e}"); return ChatMessagesPage { messages: vec![], has_more: false }; } };
            stmt.query_map(params![conversation_id, fetch_limit], |row| {
                Ok(ChatMessage {
                    id: row.get(0)?,
                    role: row.get(1)?,
                    content: row.get(2)?,
                    timestamp: row.get(3)?,
                    sort_order: Some(row.get(4)?),
                    reasoning: row.get(5).ok(),
                    activities_json: row.get(6).ok(),
                    context_mode: row.get(7).ok().flatten(),
                    images: parse_images(row.get::<_, Option<String>>(8).ok().flatten()),
                })
            }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
        }
    };
    let has_more = messages.len() as i64 > limit;
    if has_more { messages.pop(); } // remove the extra one
    messages.reverse(); // return in ascending order (oldest first)
    ChatMessagesPage { messages, has_more }
}
