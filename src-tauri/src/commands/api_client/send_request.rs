use crate::commands::AppState;
use crate::database::{
    load_api_cookie_jars_db, load_api_cookies_db, save_api_cookie_db, save_api_cookie_jar_db,
    save_api_execution_db, Database,
};
use crate::types::{ApiCookie, ApiCookieJar, ApiExecutionResponse, ApiRequestExecution};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;
use tauri::State;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequestPayload {
    pub method: String,
    pub url: String,
    pub headers: HashMap<String, String>,
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub request_id: Option<String>,
    #[serde(default)]
    pub request_name: Option<String>,
    #[serde(default)]
    pub environment_id: Option<String>,
    #[serde(default)]
    pub workspace_id: Option<String>,
    /// Client-generated unique id for THIS send attempt. Used as the cancellation
    /// handle so the request can be aborted mid-flight via `cmd_api_cancel_request`.
    #[serde(default)]
    pub send_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponsePayload {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub time: u64,
    pub size: u64,
    pub execution_id: String,
}

/// Cancel an in-flight API Client request by its `send_id`. Triggers the request's
/// cancellation token so the racing `tokio::select!` in `cmd_api_send_request`
/// drops the in-flight network future and returns early. No-op if not in flight.
#[tauri::command]
pub fn cmd_api_cancel_request(state: State<'_, AppState>, send_id: String) -> Result<(), String> {
    if let Ok(map) = state.api_in_flight.lock() {
        if let Some(token) = map.get(&send_id) {
            token.cancel();
        }
    }
    Ok(())
}

/// Removes this send's cancellation token from the in-flight registry when the
/// send finishes, on every exit path (success, error, or cancel).
struct SendCancelGuard<'a> {
    state: &'a AppState,
    send_id: Option<String>,
}

impl Drop for SendCancelGuard<'_> {
    fn drop(&mut self) {
        if let Some(id) = &self.send_id {
            if let Ok(mut map) = self.state.api_in_flight.lock() {
                map.remove(id);
            }
        }
    }
}

/// Persist a `cancelled` execution to history so a cancelled request is visible
/// in the History panel, mirroring how failed requests are logged.
fn save_cancelled_execution(
    db: &Database,
    payload: &HttpRequestPayload,
    execution_id: &str,
    response_id: &str,
    workspace_id: &str,
    now_str: &str,
    duration_ms: i64,
) {
    let exec = ApiRequestExecution {
        id: execution_id.to_string(),
        request_id: payload.request_id.clone(),
        environment_id: payload.environment_id.clone(),
        workspace_id: workspace_id.to_string(),
        name: payload.request_name.clone().unwrap_or_default(),
        method: payload.method.clone(),
        url: payload.url.clone(),
        resolved_url: payload.url.clone(),
        headers_snapshot: serde_json::to_string(&payload.headers).unwrap_or_default(),
        body_snapshot: payload.body.clone().unwrap_or_default(),
        auth_snapshot: "{}".to_string(),
        status: "cancelled".to_string(),
        error_message: Some("Request cancelled".to_string()),
        duration_ms,
        executed_at: now_str.to_string(),
        created_at: now_str.to_string(),
    };
    let resp = ApiExecutionResponse {
        id: response_id.to_string(),
        execution_id: execution_id.to_string(),
        status_code: 0,
        status_text: "Cancelled".to_string(),
        headers: "{}".to_string(),
        body: "Request cancelled".to_string(),
        body_storage_type: "inline".to_string(),
        blob_path: None,
        size_bytes: 0,
        timing_total_ms: duration_ms,
        timing_dns_ms: None,
        timing_connect_ms: None,
        timing_tls_ms: None,
        timing_ttfb_ms: None,
        timing_download_ms: None,
        received_at: now_str.to_string(),
        created_at: now_str.to_string(),
    };
    save_api_execution_db(db, &exec, &resp);
}

#[tauri::command]
pub async fn cmd_api_send_request(
    state: State<'_, AppState>,
    payload: HttpRequestPayload,
) -> Result<HttpResponsePayload, String> {
    let start = Instant::now();
    let now_str = chrono::Utc::now().to_rfc3339();
    let execution_id = Uuid::new_v4().to_string();
    let response_id = Uuid::new_v4().to_string();
    let workspace_id = payload.workspace_id.clone().unwrap_or_else(|| "default".to_string());

    // Register a cancellation token for this send so the request can be aborted
    // mid-flight from the UI via `cmd_api_cancel_request`. Keyed by the client
    // `send_id`; the guard removes it on every exit path (success/error/cancel).
    let cancel_token = payload.send_id.as_ref().map(|id| {
        let token = CancellationToken::new();
        if let Ok(mut map) = state.api_in_flight.lock() {
            map.insert(id.clone(), token.clone());
        }
        token
    });
    let _cancel_guard = SendCancelGuard {
        state: &*state,
        send_id: payload.send_id.clone(),
    };

    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(false)
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| e.to_string())?;

    let method = payload.method.parse::<reqwest::Method>().map_err(|e| e.to_string())?;

    let mut request = client.request(method, &payload.url);

    // Track which header keys the user already provided (case-insensitive).
    let user_header_keys: std::collections::HashSet<String> = payload
        .headers
        .keys()
        .map(|k| k.to_ascii_lowercase())
        .collect();

    for (key, value) in &payload.headers {
        request = request.header(key.as_str(), value.as_str());
    }

    // Inject sensible default headers (Postman/Bruno parity) only when the user
    // has not already specified them, so user-provided values always win and
    // existing behavior stays backward-compatible. `Accept-Encoding` is left to
    // reqwest, which sets it automatically (gzip/brotli/deflate) and decodes the
    // response transparently.
    if !user_header_keys.contains("accept") {
        request = request.header("Accept", "*/*");
    }
    if !user_header_keys.contains("user-agent") {
        request = request.header(
            "User-Agent",
            concat!("Genisys-API-Client/", env!("CARGO_PKG_VERSION")),
        );
    }

    // Attach stored cookies that match this request (domain/path/secure/expiry),
    // unless the user already provided a Cookie header explicitly. This mirrors
    // Postman/Bruno, which send cookies from their cookie jar automatically.
    if !user_header_keys.contains("cookie") {
        if let Ok(parsed_url) = reqwest::Url::parse(&payload.url) {
            let stored = collect_workspace_cookies(&state.db, &workspace_id);
            if let Some(cookie_header) = build_cookie_header(&stored, &parsed_url) {
                request = request.header("Cookie", cookie_header);
            }
        }
    }

    if let Some(body) = &payload.body {
        request = request.body(body.clone());
    }

    // Fire the request, racing it against cancellation. If cancelled, dropping the
    // `send` future aborts the in-flight connection; we log a `cancelled` entry.
    let send_result = match &cancel_token {
        Some(token) => tokio::select! {
            biased;
            _ = token.cancelled() => {
                let duration = start.elapsed().as_millis() as i64;
                save_cancelled_execution(
                    &state.db, &payload, &execution_id, &response_id, &workspace_id,
                    &now_str, duration,
                );
                return Err("cancelled".to_string());
            }
            res = request.send() => res,
        },
        None => request.send().await,
    };

    let response = send_result.map_err(|e| {
        // Log failed execution
        let duration = start.elapsed().as_millis() as i64;
        let exec = ApiRequestExecution {
            id: execution_id.clone(),
            request_id: payload.request_id.clone(),
            environment_id: payload.environment_id.clone(),
            workspace_id: workspace_id.clone(),
            name: payload.request_name.clone().unwrap_or_default(),
            method: payload.method.clone(),
            url: payload.url.clone(),
            resolved_url: payload.url.clone(),
            headers_snapshot: serde_json::to_string(&payload.headers).unwrap_or_default(),
            body_snapshot: payload.body.clone().unwrap_or_default(),
            auth_snapshot: "{}".to_string(),
            status: "error".to_string(),
            error_message: Some(e.to_string()),
            duration_ms: duration,
            executed_at: now_str.clone(),
            created_at: now_str.clone(),
        };
        let resp = ApiExecutionResponse {
            id: response_id.clone(),
            execution_id: execution_id.clone(),
            status_code: 0,
            status_text: "Error".to_string(),
            headers: "{}".to_string(),
            body: e.to_string(),
            body_storage_type: "inline".to_string(),
            blob_path: None,
            size_bytes: 0,
            timing_total_ms: duration,
            timing_dns_ms: None,
            timing_connect_ms: None,
            timing_tls_ms: None,
            timing_ttfb_ms: None,
            timing_download_ms: None,
            received_at: now_str.clone(),
            created_at: now_str.clone(),
        };
        save_api_execution_db(&state.db, &exec, &resp);
        e.to_string()
    })?;

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("")
        .to_string();

    let mut headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(v) = value.to_str() {
            headers.insert(key.to_string(), v.to_string());
        }
    }

    // Capture any Set-Cookie headers into the workspace cookie jar so subsequent
    // requests reuse the session (Postman/Bruno-style cookie persistence).
    let final_host = response.url().host_str().map(|s| s.to_string());
    let captured = parse_response_cookies(&response, final_host.as_deref());
    if !captured.is_empty() {
        persist_cookies(&state.db, &workspace_id, &captured);
    }

    // Read the body, still racing against cancellation (large downloads can be the
    // slow part). Dropping the `bytes` future aborts the in-flight transfer.
    let body_bytes = match &cancel_token {
        Some(token) => tokio::select! {
            biased;
            _ = token.cancelled() => {
                let duration = start.elapsed().as_millis() as i64;
                save_cancelled_execution(
                    &state.db, &payload, &execution_id, &response_id, &workspace_id,
                    &now_str, duration,
                );
                return Err("cancelled".to_string());
            }
            res = response.bytes() => res,
        },
        None => response.bytes().await,
    }
    .map_err(|e| e.to_string())?;
    let size = body_bytes.len() as u64;
    let body = String::from_utf8_lossy(&body_bytes).to_string();
    let time = start.elapsed().as_millis() as u64;

    // Persist execution + response to history
    let exec = ApiRequestExecution {
        id: execution_id.clone(),
        request_id: payload.request_id.clone(),
        environment_id: payload.environment_id.clone(),
        workspace_id,
        name: payload.request_name.clone().unwrap_or_default(),
        method: payload.method.clone(),
        url: payload.url.clone(),
        resolved_url: payload.url.clone(),
        headers_snapshot: serde_json::to_string(&payload.headers).unwrap_or_default(),
        body_snapshot: payload.body.unwrap_or_default(),
        auth_snapshot: "{}".to_string(),
        status: "success".to_string(),
        error_message: None,
        duration_ms: time as i64,
        executed_at: now_str.clone(),
        created_at: now_str.clone(),
    };
    let exec_resp = ApiExecutionResponse {
        id: response_id,
        execution_id: execution_id.clone(),
        status_code: status as i64,
        status_text: status_text.clone(),
        headers: serde_json::to_string(&headers).unwrap_or_default(),
        body: body.clone(),
        body_storage_type: "inline".to_string(),
        blob_path: None,
        size_bytes: size as i64,
        timing_total_ms: time as i64,
        timing_dns_ms: None,
        timing_connect_ms: None,
        timing_tls_ms: None,
        timing_ttfb_ms: None,
        timing_download_ms: None,
        received_at: now_str.clone(),
        created_at: now_str,
    };
    save_api_execution_db(&state.db, &exec, &exec_resp);

    Ok(HttpResponsePayload {
        status,
        status_text,
        headers,
        body,
        time,
        size,
        execution_id,
    })
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────

/// Load all stored cookies across every cookie jar in the workspace.
fn collect_workspace_cookies(db: &Database, workspace_id: &str) -> Vec<ApiCookie> {
    load_api_cookie_jars_db(db, workspace_id)
        .iter()
        .flat_map(|jar| load_api_cookies_db(db, &jar.id))
        .collect()
}

/// Build a `Cookie` request-header value from the cookies that match `url`.
fn build_cookie_header(cookies: &[ApiCookie], url: &reqwest::Url) -> Option<String> {
    let now = chrono::Utc::now();
    let mut seen = std::collections::HashSet::new();
    let mut parts: Vec<String> = Vec::new();
    for c in cookies {
        if cookie_matches(c, url, now) && seen.insert(c.name.clone()) {
            parts.push(format!("{}={}", c.name, c.value));
        }
    }
    if parts.is_empty() {
        None
    } else {
        Some(parts.join("; "))
    }
}

/// RFC 6265-style match of a stored cookie against a request URL.
fn cookie_matches(cookie: &ApiCookie, url: &reqwest::Url, now: chrono::DateTime<chrono::Utc>) -> bool {
    // Secure cookies are only sent over https.
    if cookie.secure && url.scheme() != "https" {
        return false;
    }
    // Skip expired cookies.
    if let Some(exp) = &cookie.expires_at {
        if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(exp) {
            if dt.with_timezone(&chrono::Utc) < now {
                return false;
            }
        }
    }
    // Domain match (host-only or domain-suffix).
    let host = match url.host_str() {
        Some(h) => h.to_ascii_lowercase(),
        None => return false,
    };
    let dom = cookie.domain.trim().trim_start_matches('.').to_ascii_lowercase();
    if dom.is_empty() {
        return false;
    }
    let domain_match = host == dom || host.ends_with(&format!(".{dom}"));
    if !domain_match {
        return false;
    }
    path_matches(url.path(), &cookie.path)
}

fn path_matches(req_path: &str, cookie_path: &str) -> bool {
    let cp = if cookie_path.is_empty() { "/" } else { cookie_path };
    if req_path == cp {
        return true;
    }
    if req_path.starts_with(cp) {
        if cp.ends_with('/') {
            return true;
        }
        if req_path.as_bytes().get(cp.len()) == Some(&b'/') {
            return true;
        }
    }
    false
}

/// Convert the response's `Set-Cookie` headers into storable cookies.
fn parse_response_cookies(response: &reqwest::Response, default_host: Option<&str>) -> Vec<ApiCookie> {
    let now = chrono::Utc::now().to_rfc3339();
    response
        .cookies()
        .map(|c| {
            let domain = c
                .domain()
                .map(|d| d.to_string())
                .unwrap_or_else(|| default_host.unwrap_or("").to_string());
            let path = c.path().unwrap_or("/").to_string();
            let same_site = if c.same_site_strict() {
                "Strict"
            } else if c.same_site_lax() {
                "Lax"
            } else {
                "None"
            }
            .to_string();
            let expires_at = c.expires().map(|st| {
                let dt: chrono::DateTime<chrono::Utc> = st.into();
                dt.to_rfc3339()
            });
            ApiCookie {
                id: String::new(),
                jar_id: String::new(),
                name: c.name().to_string(),
                value: c.value().to_string(),
                domain,
                path,
                secure: c.secure(),
                http_only: c.http_only(),
                same_site,
                expires_at,
                created_at: now.clone(),
                updated_at: now.clone(),
            }
        })
        .collect()
}

/// Persist captured cookies into the workspace jar, upserting by name+domain+path.
fn persist_cookies(db: &Database, workspace_id: &str, cookies: &[ApiCookie]) {
    let jar_id = ensure_workspace_jar(db, workspace_id);
    for c in cookies {
        if c.name.is_empty() {
            continue;
        }
        let domain_key = c.domain.trim_start_matches('.').to_ascii_lowercase();
        let id = format!("{}|{}|{}|{}", jar_id, domain_key, c.path, c.name);
        let cookie = ApiCookie {
            id,
            jar_id: jar_id.clone(),
            ..c.clone()
        };
        save_api_cookie_db(db, &cookie);
    }
}

/// Return the first cookie jar for the workspace, creating a default one if needed.
fn ensure_workspace_jar(db: &Database, workspace_id: &str) -> String {
    if let Some(jar) = load_api_cookie_jars_db(db, workspace_id).into_iter().next() {
        return jar.id;
    }
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    save_api_cookie_jar_db(
        db,
        &ApiCookieJar {
            id: id.clone(),
            workspace_id: workspace_id.to_string(),
            environment_id: None,
            name: "Default".to_string(),
            created_at: now.clone(),
            updated_at: now,
        },
    );
    id
}
