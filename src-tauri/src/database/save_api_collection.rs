use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_api_collection_db(db: &Database, collection: &ApiCollection) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "INSERT INTO api_collections (id, workspace_id, name, description, color, sort_order, deleted_at, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)
         ON CONFLICT(id) DO UPDATE SET
            workspace_id = excluded.workspace_id,
            name = excluded.name,
            description = excluded.description,
            color = excluded.color,
            sort_order = excluded.sort_order,
            deleted_at = excluded.deleted_at,
            updated_at = excluded.updated_at",
        params![
            collection.id,
            collection.workspace_id,
            collection.name,
            collection.description,
            collection.color,
            collection.sort_order,
            collection.deleted_at,
            collection.created_at,
            collection.updated_at,
        ],
    )
    .map(|_| ())
    .map_err(|e| {
        eprintln!("[db] save_api_collection: {e}");
        format!("Failed to save collection: {e}")
    })
}
