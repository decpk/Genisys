use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_prompt_db(db: &Database, prompt: &Prompt) {
    let conn = db.conn();
    let tags_json = serde_json::to_string(&prompt.tags).unwrap_or_else(|_| "[]".to_string());
    let metadata_json = serde_json::to_string(&prompt.metadata).unwrap_or_else(|_| "{}".to_string());
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO prompts
            (id, title, description, content, tags, is_favorite, usage_count,
             last_used_at, created_at, updated_at, metadata)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
        params![prompt.id, prompt.title, prompt.description, prompt.content,
                tags_json, prompt.is_favorite as i64, prompt.usage_count,
                prompt.last_used_at, prompt.created_at, prompt.updated_at, metadata_json],
    ) { eprintln!("[db] save_prompt: {e}"); }
}
