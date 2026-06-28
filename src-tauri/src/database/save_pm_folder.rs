use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_pm_folder_db(db: &Database, folder: &PmFolder) {
    let conn = db.conn();
    let scopes_json = serde_json::to_string(&folder.scopes).unwrap_or_else(|_| "[]".to_string());
    if let Err(e) = conn.execute(
        "INSERT INTO pm_folders (id, name, color, scopes_json, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            color = excluded.color,
            scopes_json = excluded.scopes_json,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at",
        params![
            folder.id,
            folder.name,
            folder.color,
            scopes_json,
            folder.sort_order,
            folder.created_at,
            folder.updated_at
        ],
    ) {
        eprintln!("[db] save_pm_folder: {e}");
    }
}
