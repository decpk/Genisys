use reqwest::blocking::Client;

use super::mhtml_builder::MhtmlPart;

/// Fetch a single sub-resource (CSS, image, font, etc.) and return it as an MHTML part.
pub fn fetch_resource(client: &Client, url: &str) -> Result<MhtmlPart, String> {
    let resp = client
        .get(url)
        .send()
        .map_err(|e| format!("Fetch failed: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }

    let content_type = resp
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| guess_content_type(url));

    let data = resp
        .bytes()
        .map_err(|e| format!("Read body failed: {e}"))?
        .to_vec();

    // Skip excessively large resources (> 10 MB)
    if data.len() > 10 * 1024 * 1024 {
        return Err("Resource too large (> 10 MB)".to_string());
    }

    Ok(MhtmlPart {
        content_type,
        content_location: url.to_string(),
        data,
    })
}

fn guess_content_type(url: &str) -> String {
    let lower = url.to_lowercase();
    if lower.ends_with(".css") {
        "text/css".to_string()
    } else if lower.ends_with(".png") {
        "image/png".to_string()
    } else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        "image/jpeg".to_string()
    } else if lower.ends_with(".gif") {
        "image/gif".to_string()
    } else if lower.ends_with(".svg") {
        "image/svg+xml".to_string()
    } else if lower.ends_with(".webp") {
        "image/webp".to_string()
    } else if lower.ends_with(".woff2") {
        "font/woff2".to_string()
    } else if lower.ends_with(".woff") {
        "font/woff".to_string()
    } else if lower.ends_with(".ico") {
        "image/x-icon".to_string()
    } else {
        "application/octet-stream".to_string()
    }
}
