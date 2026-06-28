use super::Database;
use crate::types::*;

pub fn load_chat_list_db(db: &Database) -> Vec<ChatConversationMeta> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, title, created_at, updated_at, message_count
         FROM conversations ORDER BY updated_at DESC",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_chat_list prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| {
        Ok(ChatConversationMeta {
            id: row.get(0)?, title: row.get(1)?, created_at: row.get(2)?,
            updated_at: row.get(3)?, message_count: row.get(4)?,
        })
    }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
