use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_api_request_db(db: &Database, request: &ApiRequest) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "INSERT INTO api_requests (id, workspace_id, collection_id, folder_id, name, method, url, params, headers,
            body_type, body_content, auth_type, auth_data, default_environment_id, sort_order, deleted_at, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18)
         ON CONFLICT(id) DO UPDATE SET
            workspace_id = excluded.workspace_id,
            collection_id = excluded.collection_id,
            folder_id = excluded.folder_id,
            name = excluded.name,
            method = excluded.method,
            url = excluded.url,
            params = excluded.params,
            headers = excluded.headers,
            body_type = excluded.body_type,
            body_content = excluded.body_content,
            auth_type = excluded.auth_type,
            auth_data = excluded.auth_data,
            default_environment_id = excluded.default_environment_id,
            sort_order = excluded.sort_order,
            deleted_at = excluded.deleted_at,
            updated_at = excluded.updated_at",
        params![
            request.id,
            request.workspace_id,
            request.collection_id,
            request.folder_id,
            request.name,
            request.method,
            request.url,
            request.params,
            request.headers,
            request.body_type,
            request.body_content,
            request.auth_type,
            request.auth_data,
            request.default_environment_id,
            request.sort_order,
            request.deleted_at,
            request.created_at,
            request.updated_at,
        ],
    )
    .map(|_| ())
    .map_err(|e| {
        eprintln!("[db] save_api_request: {e}");
        format!("Failed to save request: {e}")
    })
}
