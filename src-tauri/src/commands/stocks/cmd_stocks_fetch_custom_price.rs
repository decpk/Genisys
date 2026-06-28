use serde_json::Value;
use url::Url;

use crate::commands::err_val;
use crate::commands::stocks::yahoo_client::build_yahoo_client;

/// Fetch an arbitrary user-supplied URL expected to return JSON.
/// The user provides this on a per-stock basis (e.g. an internal pricing API or
/// a third-party data feed). We just GET it and pass the parsed body through —
/// the frontend is responsible for picking fields out.
///
/// Only http(s) URLs are accepted.
fn fetch_custom(url: &str) -> Result<Value, String> {
    let parsed = Url::parse(url).map_err(|e| format!("Invalid URL: {e}"))?;
    let scheme = parsed.scheme();
    if scheme != "http" && scheme != "https" {
        return Err(format!("Unsupported URL scheme: {scheme}"));
    }
    let client = build_yahoo_client()?;
    let resp = client
        .get(url)
        .send()
        .map_err(|e: reqwest::Error| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }
    let body: Value = resp
        .json()
        .map_err(|e: reqwest::Error| format!("JSON parse: {e}"))?;
    Ok(body)
}

#[tauri::command]
pub async fn cmd_stocks_fetch_custom_price(url: String) -> Value {
    let trimmed = url.trim().to_string();
    if trimmed.is_empty() {
        return err_val("Empty URL");
    }
    match tokio::task::spawn_blocking(move || fetch_custom(&trimmed)).await {
        Ok(Ok(body)) => serde_json::json!({ "success": true, "data": body }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
