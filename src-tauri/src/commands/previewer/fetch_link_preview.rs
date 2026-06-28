use super::extract_link_metadata::extract_link_metadata;
use super::resolve_embeddable::resolve_embeddable;
use crate::commands::err_val;
use reqwest::header::{self, HeaderMap, HeaderValue};
use serde_json::Value;
use url::Url;

const BROWSER_UA: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/// Blocking fetch + parse of a single URL into a link-preview object.
/// Runs inside `spawn_blocking`. Returns the inner `preview` value on success.
fn fetch_preview_blocking(requested_url: &str) -> Result<Value, String> {
    let parsed = Url::parse(requested_url).map_err(|e| format!("Invalid URL: {e}"))?;

    // ── reqwest client (mirrors chat::crawl_webpage) ───────────
    let mut headers = HeaderMap::new();
    headers.insert(
        header::ACCEPT,
        HeaderValue::from_static(
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        ),
    );
    headers.insert(header::ACCEPT_LANGUAGE, HeaderValue::from_static("en-US,en;q=0.9"));
    headers.insert(header::ACCEPT_ENCODING, HeaderValue::from_static("gzip, deflate, br"));
    headers.insert(header::UPGRADE_INSECURE_REQUESTS, HeaderValue::from_static("1"));

    let client = reqwest::blocking::Client::builder()
        .user_agent(BROWSER_UA)
        .default_headers(headers)
        .timeout(std::time::Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(10))
        .cookie_store(true)
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .build()
        .map_err(|e: reqwest::Error| e.to_string())?;

    let resp = client
        .get(requested_url)
        .send()
        .map_err(|e: reqwest::Error| e.to_string())?;

    // Capture redirect target + headers before the body consumes `resp`.
    let final_url = resp.url().to_string();
    let resp_headers = resp.headers().clone();
    let embeddable = resolve_embeddable(&resp_headers);

    let html = match resp.text() {
        Ok(body) => body,
        Err(_) => {
            // Headers arrived but the body could not be decoded → partial data.
            let host = parsed.host_str().unwrap_or("").to_string();
            return Ok(serde_json::json!({
                "url": requested_url,
                "finalUrl": final_url,
                "title": "",
                "description": "",
                "siteName": host,
                "faviconUrl": "",
                "imageUrl": "",
                "themeColor": "",
                "embeddable": "unknown",
            }));
        }
    };

    let document = scraper::Html::parse_document(&html);
    let meta = extract_link_metadata(&document, &final_url);

    Ok(serde_json::json!({
        "url": requested_url,
        "finalUrl": final_url,
        "title": meta.title,
        "description": meta.description,
        "siteName": meta.site_name,
        "faviconUrl": meta.favicon_url,
        "imageUrl": meta.image_url,
        "themeColor": meta.theme_color,
        "embeddable": embeddable,
    }))
}

#[tauri::command]
pub async fn cmd_fetch_link_preview(url: String) -> Value {
    match tokio::task::spawn_blocking(move || fetch_preview_blocking(&url)).await {
        Ok(Ok(preview)) => serde_json::json!({ "success": true, "preview": preview }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
