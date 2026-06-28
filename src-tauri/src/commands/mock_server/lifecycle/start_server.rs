use crate::commands::mock_server::ports::find_available_port;
use crate::commands::mock_server::runtime::build_mock_router;
use crate::commands::mock_server::state::{MockServerState, ServerHandle};
use crate::commands::mock_server::types::EndpointData;
use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub async fn cmd_mock_start_server(
    state: State<'_, AppState>,
    mock_state: State<'_, MockServerState>,
    app_handle: tauri::AppHandle,
    server_id: String,
) -> Result<Value, String> {
    // Load server info from DB
    let (server_name, port) = {
        let conn = state.db.reader();
        match conn.query_row(
            "SELECT name, port FROM mock_servers WHERE id = ?1",
            rusqlite::params![server_id],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)? as u16)),
        ) {
            Ok(s) => s,
            Err(e) => {
                return Ok(
                    json!({"success": false, "error": format!("Server not found: {}", e)}),
                )
            }
        }
    };

    // Check port < 1024
    if port < 1024 {
        let suggested = find_available_port(1024);
        return Ok(json!({
            "success": false,
            "error": format!("Ports below 1024 require elevated permissions"),
            "suggested_port": suggested,
        }));
    }

    // Check if this port is already used by one of our mock servers
    {
        let servers = mock_state.servers.lock().await;
        for (sid, handle) in servers.iter() {
            if handle.port == port && *sid != server_id {
                return Ok(json!({
                    "success": false,
                    "error": format!("Port {} is already used by mock server '{}'", port, handle.server_name),
                    "suggested_port": find_available_port(port + 1),
                }));
            }
        }

        // Check if the server is already running
        if servers.contains_key(&server_id) {
            return Ok(json!({
                "success": false,
                "error": "Server is already running",
            }));
        }
    }

    // Load active endpoints from DB
    let endpoints = {
        let conn = state.db.reader();
        let mut stmt = match conn.prepare(
            "SELECT id, method, path, status_code, response_headers, response_body, delay_ms, variant_mode, \
             response_type, ai_prompt, ai_schema, ai_count, ai_mode, ai_cache_ttl_ms, ai_pool_size \
             FROM mock_endpoints WHERE server_id = ?1 AND is_active = 1",
        ) {
            Ok(s) => s,
            Err(e) => return Ok(json!({"success": false, "error": e.to_string()})),
        };

        let mut eps: Vec<EndpointData> = match stmt.query_map(rusqlite::params![server_id], |row| {
            Ok(EndpointData {
                id: row.get(0)?,
                method: row.get(1)?,
                path: row.get(2)?,
                status_code: row.get::<_, i64>(3)? as u16,
                response_headers: row.get(4)?,
                response_body: row.get(5)?,
                delay_ms: row.get::<_, i64>(6).unwrap_or(0) as u64,
                variant_mode: row.get::<_, String>(7).unwrap_or_else(|_| "single".to_string()),
                variants: Vec::new(),
                response_type: row.get::<_, String>(8).unwrap_or_else(|_| "static".to_string()),
                ai_prompt: row.get::<_, String>(9).unwrap_or_default(),
                ai_schema: row.get::<_, String>(10).unwrap_or_default(),
                ai_count: row.get::<_, i64>(11).unwrap_or(1),
                ai_mode: row.get::<_, String>(12).unwrap_or_else(|_| "live".to_string()),
                ai_cache_ttl_ms: row.get::<_, i64>(13).unwrap_or(60000),
                ai_pool_size: row.get::<_, i64>(14).unwrap_or(5),
            })
        }) {
            Ok(mapped) => mapped.filter_map(|r| r.ok()).collect(),
            Err(_) => vec![],
        };

        // Load active variants for each endpoint (only when a variant mode is set).
        for ep in eps.iter_mut() {
            if ep.variant_mode == "single" {
                continue;
            }
            if let Ok(mut vstmt) = conn.prepare(
                "SELECT id, name, status_code, response_headers, response_body, match_rules, weight, order_index \
                 FROM mock_endpoint_variants WHERE endpoint_id = ?1 AND is_active = 1 ORDER BY order_index ASC",
            ) {
                if let Ok(mapped) = vstmt.query_map(rusqlite::params![ep.id], |row| {
                    Ok(crate::commands::mock_server::runtime::variants::VariantData {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        status_code: row.get::<_, i64>(2)? as u16,
                        response_headers: row.get(3)?,
                        response_body: row.get(4)?,
                        match_rules: row.get::<_, String>(5).unwrap_or_else(|_| "[]".to_string()),
                        weight: row.get::<_, i64>(6).unwrap_or(1),
                        order_index: row.get::<_, i64>(7).unwrap_or(0),
                    })
                }) {
                    ep.variants = mapped.filter_map(|r| r.ok()).collect();
                }
            }
        }
        eps
    };

    // Build router
    let router = build_mock_router(server_id.clone(), endpoints, app_handle);

    // Try to bind to the port
    let listener = match tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port)).await {
        Ok(l) => l,
        Err(e) => {
            let suggested = find_available_port(port + 1);
            let error_msg = if e.kind() == std::io::ErrorKind::AddrInUse {
                format!("Port {} is in use by another application", port)
            } else {
                format!("Failed to bind to port {}: {}", port, e)
            };
            return Ok(json!({
                "success": false,
                "error": error_msg,
                "suggested_port": suggested,
            }));
        }
    };

    // Create shutdown channel
    let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();

    // Spawn the server
    tokio::spawn(async move {
        axum::serve(listener, router)
            .with_graceful_shutdown(async {
                let _ = shutdown_rx.await;
            })
            .await
            .ok();
    });

    // Store the handle
    {
        let mut servers = mock_state.servers.lock().await;
        servers.insert(
            server_id.clone(),
            ServerHandle {
                shutdown_tx: Some(shutdown_tx),
                port,
                server_name: server_name.clone(),
            },
        );
    }

    Ok(json!({
        "success": true,
        "data": {
            "server_id": server_id,
            "port": port,
            "base_url": format!("http://127.0.0.1:{}", port),
            "name": server_name,
        }
    }))
}
