use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_snippet_db(db: &Database, snippet: &Snippet) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO snippets (id, title, content, conversation_id, is_favorite, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![snippet.id, snippet.title, snippet.content, snippet.conversation_id,
                snippet.is_favorite as i64, snippet.created_at, snippet.updated_at],
    ) { eprintln!("[db] save_snippet: {e}"); }
}
