use super::Database;
use crate::types::*;

pub fn load_pm_data_db(db: &Database) -> PmFullData {
    let conn = db.reader();

    let folders = conn
        .prepare("SELECT id, name, color, scopes_json, sort_order, created_at, updated_at FROM pm_folders ORDER BY sort_order")
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                let scopes_json: String = row.get(3).unwrap_or_else(|_| "[]".to_string());
                let scopes: Vec<String> = serde_json::from_str(&scopes_json).unwrap_or_default();
                Ok(PmFolder {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    scopes,
                    sort_order: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_default();

    let categories = conn
        .prepare("SELECT id, folder_id, name, icon, sort_order, created_at, updated_at FROM pm_categories ORDER BY sort_order")
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                Ok(PmCategory {
                    id: row.get(0)?,
                    folder_id: row.get(1)?,
                    name: row.get(2)?,
                    icon: row.get(3)?,
                    sort_order: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_default();

    let prompts = conn
        .prepare(
            "SELECT id, category_id, folder_id, title, content, description, is_pinned, sort_order, created_at, updated_at, app_scopes
             FROM pm_prompts ORDER BY sort_order",
        )
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                let app_scopes_json: Option<String> = row.get(10).ok();
                let app_scopes: Option<Vec<String>> = app_scopes_json
                    .and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok())
                    .filter(|v| !v.is_empty());
                Ok(PmPrompt {
                    id: row.get(0)?,
                    category_id: row.get(1)?,
                    folder_id: row.get(2)?,
                    title: row.get(3)?,
                    content: row.get(4)?,
                    description: row.get(5)?,
                    is_pinned: row.get::<_, i64>(6)? != 0,
                    sort_order: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                    app_scopes,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_default();

    PmFullData { folders, categories, prompts }
}
