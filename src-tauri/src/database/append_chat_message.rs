use rusqlite::params;

use super::Database;
use crate::types::*;

/// Append a single message to an existing conversation without rewriting all messages.
/// Also upserts the conversation metadata (title, updated_at).
pub fn append_chat_message_db(
    db: &Database,
    conversation_id: &str,
    title: &str,
    created_at: &str,
    updated_at: &str,
    message: &ChatMessage,
) -> Result<(), String> {
    let fn_start = std::time::Instant::now();
    println!("[ChatFlow] cmd_append_chat_message() → append_chat_message_db() [{}]", message.role);
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        let msg = format!("begin txn: {e}");
        eprintln!("[db] append_chat_message {msg}"); return Err(msg);
    }
    // Upsert conversation metadata
    if let Err(e) = conn.execute(
        "INSERT INTO conversations (id, title, created_at, updated_at, message_count) VALUES (?1,?2,?3,?4,1)
         ON CONFLICT(id) DO UPDATE SET title=excluded.title, updated_at=excluded.updated_at, message_count=message_count+1",
        params![conversation_id, title, created_at, updated_at],
    ) { let msg = format!("upsert conv: {e}"); eprintln!("[db] append_chat_message {msg}"); let _ = conn.execute_batch("ROLLBACK"); return Err(msg); }
    // Get next sort_order
    let next_order: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) + 1 FROM chat_messages WHERE conversation_id = ?1",
            params![conversation_id],
            |row| row.get(0),
        )
        .unwrap_or(0);
    // Serialize attached image filenames as a JSON array (NULL when none).
    let images_json: Option<String> = match &message.images {
        Some(imgs) if !imgs.is_empty() => serde_json::to_string(imgs).ok(),
        _ => None,
    };
    if let Err(e) = conn.execute(
        "INSERT INTO chat_messages (id, conversation_id, role, content, timestamp, sort_order, reasoning, activities_json, images) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![message.id, conversation_id, message.role, message.content, message.timestamp, next_order, message.reasoning, message.activities_json, images_json],
    ) { let msg = format!("insert msg: {e}"); eprintln!("[db] append_chat_message {msg}"); let _ = conn.execute_batch("ROLLBACK"); return Err(msg); }
    if let Err(e) = conn.execute_batch("COMMIT") {
        let msg = format!("commit: {e}");
        eprintln!("[db] append_chat_message {msg}");
        let _ = conn.execute_batch("ROLLBACK");
        return Err(msg);
    }
    let fn_elapsed = fn_start.elapsed();
    println!("[ChatFlow] append_chat_message_db() [{}] | start: 0ms | end: {:.2}ms | diff: {:.2}ms", message.role, fn_elapsed.as_secs_f64() * 1000.0, fn_elapsed.as_secs_f64() * 1000.0);
    Ok(())
}
