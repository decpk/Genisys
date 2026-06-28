use super::Database;
use crate::types::*;

fn row_to_prompt(row: &rusqlite::Row) -> rusqlite::Result<Prompt> {
    let tags_str: String = row.get(4)?;
    let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
    let is_fav: i64 = row.get(5)?;
    let metadata_str: String = row.get(10)?;
    let metadata: serde_json::Value = serde_json::from_str(&metadata_str).unwrap_or(serde_json::json!({}));
    Ok(Prompt {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        content: row.get(3)?,
        tags,
        is_favorite: is_fav != 0,
        usage_count: row.get(6)?,
        last_used_at: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
        metadata,
    })
}

pub fn load_prompts_db(db: &Database) -> Vec<Prompt> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, title, description, content, tags, is_favorite, usage_count,
                last_used_at, created_at, updated_at, metadata
         FROM prompts ORDER BY updated_at DESC",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_prompts prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| row_to_prompt(row))
        .map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
