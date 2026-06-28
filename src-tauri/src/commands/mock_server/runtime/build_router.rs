use crate::commands::mock_server::runtime::templating::{
    extract_path_params, parse_query, render_template, TemplateContext,
};
use crate::commands::mock_server::runtime::variants::{
    select_variant, VariantRequestCtx,
};
use crate::commands::mock_server::runtime::ai_runtime::{
    ai_cache_get_or_set, ai_pool_rotate, generate_ai_response, AiState,
};
use crate::commands::mock_server::types::EndpointData;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::atomic::AtomicU64;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;

/// Build an axum Router from a list of endpoints, emitting request logs via tauri events.
pub(crate) fn build_mock_router(
    server_id: String,
    endpoints: Vec<EndpointData>,
    app_handle: tauri::AppHandle,
) -> axum::Router {
    use axum::body::Body;
    use axum::extract::Request;
    use axum::http::{HeaderName, HeaderValue, Method, StatusCode};
    use axum::response::IntoResponse;
    use axum::routing::{delete, get, head, options, patch, post, put};
    use tower_http::cors::{Any, CorsLayer};

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let mut router = axum::Router::new();

    // Collect endpoint paths for the fallback 404 response
    let endpoint_list: Vec<Value> = endpoints
        .iter()
        .map(|ep| json!({"method": ep.method, "path": ep.path}))
        .collect();

    for ep in endpoints {
        let sid = server_id.clone();
        let ah = app_handle.clone();
        let ep_clone = ep.clone();
        // Per-endpoint round-robin counter shared across all requests to this route.
        let seq_counter = Arc::new(AtomicU64::new(0));
        // Per-endpoint AI runtime state (cache + pool) for `response_type == "ai"`.
        let ai_state = Arc::new(AiState::new());

        let handler = move |req: Request<Body>| {
            let sid = sid.clone();
            let ah = ah.clone();
            let ep = ep_clone.clone();
            let seq_counter = seq_counter.clone();
            let ai_state = ai_state.clone();
            async move {
                let start = std::time::Instant::now();
                let req_method = req.method().to_string();
                let req_path = req.uri().path().to_string();
                let query_string = req.uri().query().unwrap_or("").to_string();

                // Capture request headers
                let req_headers: HashMap<String, String> = req
                    .headers()
                    .iter()
                    .map(|(k, v)| {
                        (
                            k.to_string(),
                            v.to_str().unwrap_or("<binary>").to_string(),
                        )
                    })
                    .collect();

                // Read request body (capped at 1MB)
                let req_body_str = match axum::body::to_bytes(req.into_body(), 1_048_576).await {
                    Ok(bytes) => String::from_utf8_lossy(&bytes).to_string(),
                    Err(_) => String::new(),
                };

                // Apply delay
                if ep.delay_ms > 0 {
                    tokio::time::sleep(std::time::Duration::from_millis(ep.delay_ms)).await;
                }

                // Build the templating context from path params, query params,
                // and the (optionally JSON) request body. Endpoints with no
                // `{{ }}` tokens and no `:params` behave exactly as before
                // (render_template short-circuits).
                let parsed_query = parse_query(&query_string);
                let body_json: Option<Value> = serde_json::from_str(&req_body_str).ok();

                // Select a response variant based on the endpoint's mode. When
                // `select_variant` returns None (mode "single", no variants, or
                // no conditional match) we fall back to the base response, so
                // existing endpoints are unaffected.
                let variant_ctx = VariantRequestCtx {
                    query: parsed_query.clone(),
                    headers: req_headers.clone(),
                    body_json: body_json.clone(),
                };
                let selected = select_variant(
                    &ep.variant_mode,
                    &ep.variants,
                    &seq_counter,
                    &variant_ctx,
                );

                // Resolve effective status / headers / body from the selected
                // variant, or fall back to the base endpoint values.
                let (eff_status_code, eff_headers_src, eff_body_src) = match selected {
                    Some(v) => (v.status_code, v.response_headers.clone(), v.response_body.clone()),
                    None => {
                        // Base endpoint. For `response_type == "ai"` we generate the
                        // body at request time according to `ai_mode`; on any failure
                        // we fall back to the stored `response_body` (never a 500).
                        // Variants are always treated as static, so AI only applies
                        // when no variant was selected. Static endpoints are unchanged.
                        let base_body = if ep.response_type == "ai" {
                            let ai_result = match ep.ai_mode.as_str() {
                                "cached" => {
                                    ai_cache_get_or_set(
                                        &ai_state,
                                        ep.ai_cache_ttl_ms.max(0) as u64,
                                        &ep.ai_prompt,
                                        &ep.ai_schema,
                                        ep.ai_count,
                                    )
                                    .await
                                }
                                "pool" => {
                                    ai_pool_rotate(
                                        &ai_state,
                                        ep.ai_pool_size.max(1) as usize,
                                        &ep.ai_prompt,
                                        &ep.ai_schema,
                                        ep.ai_count,
                                    )
                                    .await
                                }
                                // "live" and any unknown mode generate fresh each time.
                                _ => {
                                    generate_ai_response(
                                        &ep.ai_prompt,
                                        &ep.ai_schema,
                                        ep.ai_count,
                                    )
                                    .await
                                }
                            };
                            ai_result.unwrap_or_else(|_| ep.response_body.clone())
                        } else {
                            ep.response_body.clone()
                        };
                        (ep.status_code, ep.response_headers.clone(), base_body)
                    }
                };

                let status =
                    StatusCode::from_u16(eff_status_code).unwrap_or(StatusCode::OK);

                let template_ctx = TemplateContext {
                    params: extract_path_params(&ep.path, &req_path),
                    query: parsed_query,
                    body_json,
                };
                let rendered_body = render_template(&eff_body_src, &template_ctx);

                let mut response = (status, rendered_body.clone()).into_response();

                // Parse response headers for both applying and logging
                let resp_headers_map: HashMap<String, String> = if !eff_headers_src.is_empty() {
                    serde_json::from_str(&eff_headers_src).unwrap_or_default()
                } else {
                    HashMap::new()
                };

                // Apply custom headers
                if !resp_headers_map.is_empty() {
                    let resp_headers = response.headers_mut();
                    for (k, v) in &resp_headers_map {
                        if let (Ok(name), Ok(val)) = (
                            k.parse::<HeaderName>(),
                            HeaderValue::from_str(v),
                        ) {
                            resp_headers.insert(name, val);
                        }
                    }
                }

                let duration_ms = start.elapsed().as_millis() as u64;

                // Emit request log event with full request/response details
                let _ = ah.emit(
                    "mock-server-request-log",
                    json!({
                        "server_id": sid,
                        "method": req_method,
                        "path": req_path,
                        "status": eff_status_code,
                        "timestamp": chrono::Utc::now().to_rfc3339(),
                        "duration_ms": duration_ms,
                        "request_headers": req_headers,
                        "request_body": req_body_str,
                        "query_string": query_string,
                        "response_headers": resp_headers_map,
                        "response_body": rendered_body,
                    }),
                );

                // Also persist the log to SQLite (additive; emit above is unchanged).
                let app_state = ah.state::<crate::commands::AppState>();
                crate::database::mock_insert_request_log_db(
                    &app_state.db,
                    &sid,
                    &req_method,
                    &req_path,
                    eff_status_code as i64,
                    &chrono::Utc::now().to_rfc3339(),
                    duration_ms as i64,
                    &serde_json::to_string(&req_headers).unwrap_or_else(|_| "{}".to_string()),
                    &req_body_str,
                    &query_string,
                    &serde_json::to_string(&resp_headers_map).unwrap_or_else(|_| "{}".to_string()),
                    &rendered_body,
                );

                response
            }
        };

        let method_upper = ep.method.to_uppercase();
        let path = ep.path.clone();

        // Ensure path starts with /
        let route_path = if path.starts_with('/') {
            path
        } else {
            format!("/{}", path)
        };

        router = match method_upper.as_str() {
            "GET" => router.route(&route_path, get(handler)),
            "POST" => router.route(&route_path, post(handler)),
            "PUT" => router.route(&route_path, put(handler)),
            "PATCH" => router.route(&route_path, patch(handler)),
            "DELETE" => router.route(&route_path, delete(handler)),
            "OPTIONS" => router.route(&route_path, options(handler)),
            "HEAD" => router.route(&route_path, head(handler)),
            _ => router.route(&route_path, get(handler)),
        };
    }

    // Fallback handler: 404 with list of available endpoints
    let fallback_list = endpoint_list.clone();
    let fallback_sid = server_id.clone();
    let fallback_ah = app_handle.clone();
    router = router.fallback(move |req: Request<Body>| {
        let list = fallback_list.clone();
        let sid = fallback_sid.clone();
        let ah = fallback_ah.clone();
        async move {
            let req_method = req.method().to_string();
            let req_path = req.uri().path().to_string();
            let query_string = req.uri().query().unwrap_or("").to_string();

            // Capture request headers
            let req_headers: HashMap<String, String> = req
                .headers()
                .iter()
                .map(|(k, v)| {
                    (
                        k.to_string(),
                        v.to_str().unwrap_or("<binary>").to_string(),
                    )
                })
                .collect();

            // Read request body (capped at 1MB)
            let req_body_str = match axum::body::to_bytes(req.into_body(), 1_048_576).await {
                Ok(bytes) => String::from_utf8_lossy(&bytes).to_string(),
                Err(_) => String::new(),
            };

            let body = json!({
                "error": "Not Found",
                "message": "No mock endpoint matches this request",
                "available_endpoints": list,
            });

            let response_body_str = serde_json::to_string(&body).unwrap_or_default();

            let _ = ah.emit(
                "mock-server-request-log",
                json!({
                    "server_id": sid,
                    "method": req_method,
                    "path": req_path,
                    "status": 404,
                    "timestamp": chrono::Utc::now().to_rfc3339(),
                    "duration_ms": 0,
                    "request_headers": req_headers,
                    "request_body": req_body_str,
                    "query_string": query_string,
                    "response_headers": {"content-type": "application/json"},
                    "response_body": response_body_str,
                }),
            );

            // Also persist the 404 log to SQLite (additive; emit above is unchanged).
            let app_state = ah.state::<crate::commands::AppState>();
            crate::database::mock_insert_request_log_db(
                &app_state.db,
                &sid,
                &req_method,
                &req_path,
                404,
                &chrono::Utc::now().to_rfc3339(),
                0,
                &serde_json::to_string(&req_headers).unwrap_or_else(|_| "{}".to_string()),
                &req_body_str,
                &query_string,
                "{\"content-type\":\"application/json\"}",
                &response_body_str,
            );

            (
                StatusCode::NOT_FOUND,
                [(
                    axum::http::header::CONTENT_TYPE,
                    HeaderValue::from_static("application/json"),
                )],
                response_body_str,
            )
                .into_response()
        }
    });

    router.layer(cors)
}
