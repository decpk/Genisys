use reqwest::blocking::Client;
use std::time::Duration;

/// Max bytes we'll accept for a single image. Mirrors the MHTML resource cap.
const MAX_IMAGE_BYTES: u64 = 10 * 1024 * 1024;

/// Blocking HTTP fetch for an image. Returns `(bytes, content_type)` on
/// success. Errors propagate as readable strings so the caller can persist
/// them in the sidecar.
///
/// Designed to be called from `tokio::task::spawn_blocking` since `reqwest`'s
/// blocking client cannot run on the async runtime.
pub fn download_image(client: &Client, url: &str) -> Result<(Vec<u8>, String), String> {
    let response = client
        .get(url)
        .header("Accept", "image/*")
        .header(
            "User-Agent",
            "GenisysLibraryImageFetcher/1.0 (+https://github.com/genisys-app) reqwest",
        )
        .timeout(Duration::from_secs(20))
        .send()
        .map_err(|e| format!("request failed: {e}"))?;

    if !response.status().is_success() {
        return Err(format!("http {}", response.status()));
    }

    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/octet-stream")
        .to_string();

    if !content_type.starts_with("image/") {
        return Err(format!("non-image content-type: {content_type}"));
    }

    if let Some(len) = response.content_length() {
        if len > MAX_IMAGE_BYTES {
            return Err(format!("image too large: {len} bytes"));
        }
    }

    let bytes = response
        .bytes()
        .map_err(|e| format!("read body failed: {e}"))?
        .to_vec();

    if bytes.len() as u64 > MAX_IMAGE_BYTES {
        return Err(format!("image too large: {} bytes", bytes.len()));
    }
    if bytes.is_empty() {
        return Err("empty response body".to_string());
    }

    Ok((bytes, content_type))
}
