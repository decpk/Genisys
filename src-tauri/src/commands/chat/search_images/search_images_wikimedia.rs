//! Search Wikimedia Commons for permissively-licensed images.
//!
//! Synchronous (blocking) by design — call from inside `spawn_blocking`
//! when wiring this into an async tool dispatch loop.

use serde_json::{json, Value};

use super::build_image_search_client::build_image_search_client;
use super::build_wikimedia_search_url::build_wikimedia_search_url;
use super::fetch_wikimedia_image_info::fetch_wikimedia_image_info;

/// Search Wikimedia Commons for up to `count` images matching `query`.
/// Returns a JSON value with shape:
///
/// ```json
/// {
///   "query": "alan turing portrait",
///   "source": "Wikimedia Commons",
///   "results": [ { "url": "...", "title": "...", "domain": "...", ... } ]
/// }
/// ```
///
/// Errors are returned as `Err(String)` so the chat tool dispatch layer
/// can format them into the model's tool response.
pub fn search_images_wikimedia(query: &str, count: u32) -> Result<Value, String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Err("Query is empty".to_string());
    }

    let url = build_wikimedia_search_url(trimmed, count)?;
    let client = build_image_search_client()?;

    let resp = client
        .get(&url)
        .send()
        .map_err(|e| format!("Image search request failed: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("Image search HTTP {}", resp.status()));
    }

    let body: Value = resp
        .json()
        .map_err(|e| format!("Failed to parse image search response: {e}"))?;

    // `query.pages` is an array in formatversion=2
    let pages = body
        .get("query")
        .and_then(|q| q.get("pages"))
        .and_then(|p| p.as_array())
        .cloned()
        .unwrap_or_default();

    let mut results = Vec::with_capacity(pages.len());
    for page in &pages {
        if let Some(item) = fetch_wikimedia_image_info(page) {
            results.push(item);
        }
    }

    Ok(json!({
        "query": trimmed,
        "source": "Wikimedia Commons",
        "results": results,
    }))
}
