use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn load_chat_history_db(db: &Database) -> Vec<ChatConversation> {
    let conn = db.reader();
    let mut conv_stmt = match conn.prepare("SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC")
    { Ok(s) => s, Err(e) => { eprintln!("[db] load_chat_history prepare convs: {e}"); return vec![]; } };
    let convs: Vec<(String, String, String, String)> = conv_stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)))
        .map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default();

    let mut msg_stmt = match conn.prepare(
        "SELECT id, role, content, timestamp FROM chat_messages WHERE conversation_id = ?1 ORDER BY sort_order",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_chat_history prepare msgs: {e}"); return vec![]; } };

    convs.into_iter().map(|(id, title, created_at, updated_at)| {
        let messages: Vec<ChatMessage> = msg_stmt
            .query_map(params![id], |row| {
                Ok(ChatMessage {
                    id: row.get(0)?,
                    role: row.get(1)?,
                    content: row.get(2)?,
                    timestamp: row.get(3)?,
                    sort_order: None,
                    reasoning: None,
                    activities_json: None,
                    context_mode: None,
                    images: None,
                })
            }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default();
        ChatConversation { id, title, messages, created_at, updated_at }
    }).collect()
}
