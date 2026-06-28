use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_chat_conversation_db(db: &Database, conv: &ChatConversation) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        eprintln!("[db] save_chat_conversation begin txn: {e}"); return;
    }
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO conversations (id, title, created_at, updated_at, message_count) VALUES (?1,?2,?3,?4,?5)",
        params![conv.id, conv.title, conv.created_at, conv.updated_at, conv.messages.len() as i64],
    ) { eprintln!("[db] save_chat_conversation upsert: {e}"); let _ = conn.execute_batch("ROLLBACK"); return; }
    if let Err(e) = conn.execute("DELETE FROM chat_messages WHERE conversation_id = ?1", params![conv.id]) {
        eprintln!("[db] save_chat_conversation delete msgs: {e}"); let _ = conn.execute_batch("ROLLBACK"); return;
    }
    let mut stmt = match conn.prepare(
        "INSERT INTO chat_messages (id, conversation_id, role, content, timestamp, sort_order) VALUES (?1,?2,?3,?4,?5,?6)",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] save_chat_conversation prepare msgs: {e}"); let _ = conn.execute_batch("ROLLBACK"); return; } };
    for (i, msg) in conv.messages.iter().enumerate() {
        if let Err(e) = stmt.execute(params![msg.id, conv.id, msg.role, msg.content, msg.timestamp, i as i64]) {
            eprintln!("[db] save_chat_conversation insert msg: {e}");
        }
    }
    drop(stmt);
    if let Err(e) = conn.execute_batch("COMMIT") {
        eprintln!("[db] save_chat_conversation commit: {e}");
        let _ = conn.execute_batch("ROLLBACK");
    }
}
