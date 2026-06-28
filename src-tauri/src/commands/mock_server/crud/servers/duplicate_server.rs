use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_duplicate_server(state: State<'_, AppState>, id: String) -> Value {
    let conn = state.db.conn();

    // Read the original server row
    let server = match conn.query_row(
        "SELECT project_id, name, port FROM mock_servers WHERE id = ?1",
        rusqlite::params![id],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, i64>(2)?,
            ))
        },
    ) {
        Ok(s) => s,
        Err(_) => return json!({"success": false, "error": "Server not found"}),
    };

    let (project_id, name, _port) = server;

    // Compute a new non-conflicting port
    let new_port = match conn.query_row(
        "SELECT COALESCE(MAX(port), 2999) + 1 FROM mock_servers",
        [],
        |row| row.get::<_, i64>(0),
    ) {
        Ok(p) => p,
        Err(e) => return json!({"success": false, "error": e.to_string()}),
    };

    let new_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let new_name = format!("{} (copy)", name);

    // Insert the new server (mirrors create_server.rs)
    if let Err(e) = conn.execute(
        "INSERT INTO mock_servers (id, project_id, name, port, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![new_id, project_id, new_name, new_port, now, now],
    ) {
        return json!({"success": false, "error": e.to_string()});
    }

    // Read all endpoints for the original server (same column list as duplicate_endpoint.rs)
    let mut stmt = match conn.prepare(
        "SELECT method, path, status_code, response_headers, response_body, response_type, \
         ai_prompt, ai_schema, ai_count, delay_ms, description, is_active \
         FROM mock_endpoints WHERE server_id = ?1",
    ) {
        Ok(s) => s,
        Err(e) => return json!({"success": false, "error": e.to_string()}),
    };

    let rows = match stmt.query_map(rusqlite::params![id], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            row.get::<_, String>(6).unwrap_or_default(),
            row.get::<_, String>(7).unwrap_or_default(),
            row.get::<_, i64>(8).unwrap_or(1),
            row.get::<_, i64>(9).unwrap_or(0),
            row.get::<_, String>(10).unwrap_or_default(),
            row.get::<_, i64>(11).unwrap_or(1),
        ))
    }) {
        Ok(r) => r,
        Err(e) => return json!({"success": false, "error": e.to_string()}),
    };

    let mut endpoints: Vec<Value> = Vec::new();

    for row in rows {
        let (
            method,
            path,
            status_code,
            response_headers,
            response_body,
            response_type,
            ai_prompt,
            ai_schema,
            ai_count,
            delay_ms,
            description,
            is_active,
        ) = match row {
            Ok(r) => r,
            Err(e) => return json!({"success": false, "error": e.to_string()}),
        };

        let ep_id = uuid::Uuid::new_v4().to_string();

        if let Err(e) = conn.execute(
            "INSERT INTO mock_endpoints (id, server_id, method, path, status_code, response_headers, \
             response_body, response_type, ai_prompt, ai_schema, ai_count, delay_ms, description, \
             is_active, created_at, updated_at) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            rusqlite::params![
                ep_id, new_id, method, path, status_code, response_headers, response_body,
                response_type, ai_prompt, ai_schema, ai_count, delay_ms, description, is_active,
                now, now,
            ],
        ) {
            return json!({"success": false, "error": e.to_string()});
        }

        endpoints.push(json!({
            "id": ep_id,
            "server_id": new_id,
            "method": method,
            "path": path,
            "status_code": status_code,
            "response_headers": response_headers,
            "response_body": response_body,
            "response_type": response_type,
            "ai_prompt": ai_prompt,
            "ai_schema": ai_schema,
            "ai_count": ai_count,
            "delay_ms": delay_ms,
            "description": description,
            "is_active": is_active != 0,
            "created_at": now,
            "updated_at": now,
        }));
    }

    json!({
        "success": true,
        "data": {
            "server": {
                "id": new_id,
                "project_id": project_id,
                "name": new_name,
                "port": new_port,
                "created_at": now,
                "updated_at": now,
            },
            "endpoints": endpoints,
        }
    })
}
