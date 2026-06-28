use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_api_environment_db(db: &Database, env: &ApiEnvironment) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO api_environments (id, workspace_id, name, base_url, description, color, is_active, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)
         ON CONFLICT(id) DO UPDATE SET
            workspace_id = excluded.workspace_id,
            name = excluded.name,
            base_url = excluded.base_url,
            description = excluded.description,
            color = excluded.color,
            is_active = excluded.is_active,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at",
        params![
            env.id,
            env.workspace_id,
            env.name,
            env.base_url,
            env.description,
            env.color,
            env.is_active,
            env.sort_order,
            env.created_at,
            env.updated_at,
        ],
    ) {
        eprintln!("[db] save_api_environment: {e}");
    }
}

pub fn set_active_environment_db(db: &Database, workspace_id: &str, environment_id: &str) {
    let conn = db.conn();
    // Deactivate all environments in workspace, then activate the target
    if let Err(e) = conn.execute(
        "UPDATE api_environments SET is_active = 0 WHERE workspace_id = ?1",
        params![workspace_id],
    ) {
        eprintln!("[db] set_active_environment (deactivate): {e}");
        return;
    }
    if let Err(e) = conn.execute(
        "UPDATE api_environments SET is_active = 1 WHERE id = ?1 AND workspace_id = ?2",
        params![environment_id, workspace_id],
    ) {
        eprintln!("[db] set_active_environment (activate): {e}");
    }
}

pub fn remove_api_environment_db(db: &Database, environment_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_environments WHERE id = ?1",
        params![environment_id],
    ) {
        eprintln!("[db] remove_api_environment: {e}");
    }
}
