use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_pm_prompt_db(db: &Database, prompt: &PmPrompt) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO pm_prompts (id, category_id, folder_id, title, content, description, is_pinned, sort_order, created_at, updated_at, app_scopes)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
         ON CONFLICT(id) DO UPDATE SET
            category_id = excluded.category_id,
            folder_id = excluded.folder_id,
            title = excluded.title,
            content = excluded.content,
            description = excluded.description,
            is_pinned = excluded.is_pinned,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at,
            app_scopes = excluded.app_scopes",
        params![
            prompt.id, prompt.category_id, prompt.folder_id,
            prompt.title, prompt.content, prompt.description,
            prompt.is_pinned as i64, prompt.sort_order,
            prompt.created_at, prompt.updated_at,
            prompt.app_scopes.as_ref().map(|s| serde_json::to_string(s).unwrap_or_else(|_| "[]".to_string()))
        ],
    ) {
        eprintln!("[db] save_pm_prompt: {e}");
    }
}
