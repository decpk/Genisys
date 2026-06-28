use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_api_folder_db(db: &Database, folder: &ApiFolder) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "INSERT INTO api_folders (id, workspace_id, collection_id, parent_folder_id, name, sort_order, deleted_at, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)
         ON CONFLICT(id) DO UPDATE SET
            workspace_id = excluded.workspace_id,
            collection_id = excluded.collection_id,
            parent_folder_id = excluded.parent_folder_id,
            name = excluded.name,
            sort_order = excluded.sort_order,
            deleted_at = excluded.deleted_at,
            updated_at = excluded.updated_at",
        params![
            folder.id,
            folder.workspace_id,
            folder.collection_id,
            folder.parent_folder_id,
            folder.name,
            folder.sort_order,
            folder.deleted_at,
            folder.created_at,
            folder.updated_at,
        ],
    )
    .map(|_| ())
    .map_err(|e| {
        eprintln!("[db] save_api_folder: {e}");
        format!("Failed to save folder: {e}")
    })
}
