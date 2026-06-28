use super::Database;
use crate::types::*;

pub fn load_api_client_data_db(db: &Database) -> ApiClientData {
    let conn = db.reader();

    let workspaces = conn
        .prepare(
            "SELECT id, name, description, is_default, created_at, updated_at
             FROM workspaces ORDER BY is_default DESC, name",
        )
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                Ok(Workspace {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    is_default: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_else(|e| { eprintln!("[db] load workspaces: {e}"); vec![] });

    let collections = conn
        .prepare(
            "SELECT id, workspace_id, name, description, color, sort_order, deleted_at, created_at, updated_at
             FROM api_collections WHERE deleted_at IS NULL ORDER BY sort_order",
        )
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                Ok(ApiCollection {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    color: row.get(4)?,
                    sort_order: row.get(5)?,
                    deleted_at: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_else(|e| { eprintln!("[db] load collections: {e}"); vec![] });

    let folders = conn
        .prepare(
            "SELECT id, workspace_id, collection_id, parent_folder_id, name, sort_order, deleted_at, created_at, updated_at
             FROM api_folders WHERE deleted_at IS NULL ORDER BY sort_order",
        )
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                Ok(ApiFolder {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    collection_id: row.get(2)?,
                    parent_folder_id: row.get(3)?,
                    name: row.get(4)?,
                    sort_order: row.get(5)?,
                    deleted_at: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_else(|e| { eprintln!("[db] load folders: {e}"); vec![] });

    let requests = conn
        .prepare(
            "SELECT id, workspace_id, collection_id, folder_id, name, method, url, params, headers,
                    body_type, '' AS body_content, auth_type, auth_data, default_environment_id,
                    sort_order, deleted_at, created_at, updated_at
             FROM api_requests WHERE deleted_at IS NULL ORDER BY sort_order",
        )
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                Ok(ApiRequest {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    collection_id: row.get(2)?,
                    folder_id: row.get(3)?,
                    name: row.get(4)?,
                    method: row.get(5)?,
                    url: row.get(6)?,
                    params: row.get(7)?,
                    headers: row.get(8)?,
                    body_type: row.get(9)?,
                    body_content: row.get(10)?,
                    auth_type: row.get(11)?,
                    auth_data: row.get(12)?,
                    default_environment_id: row.get(13)?,
                    sort_order: row.get(14)?,
                    deleted_at: row.get(15)?,
                    created_at: row.get(16)?,
                    updated_at: row.get(17)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_else(|e| { eprintln!("[db] load requests: {e}"); vec![] });

    let environments: Vec<ApiEnvironment> = conn
        .prepare(
            "SELECT id, workspace_id, name, base_url, description, color, is_active, sort_order, created_at, updated_at
             FROM api_environments ORDER BY sort_order",
        )
        .and_then(|mut stmt| {
            stmt.query_map([], |row| {
                Ok(ApiEnvironment {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    name: row.get(2)?,
                    base_url: row.get(3)?,
                    description: row.get(4)?,
                    color: row.get(5)?,
                    is_active: row.get(6)?,
                    sort_order: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_else(|e| { eprintln!("[db] load environments: {e}"); vec![] });

    let active_environment_id = environments.iter().find(|e| e.is_active).map(|e| e.id.clone());

    ApiClientData {
        collections,
        folders,
        requests,
        environments,
        active_environment_id,
        workspaces,
    }
}
