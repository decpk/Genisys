use super::encode_image_for_vision::encode_image_for_vision;
use super::request_vision_urls::request_vision_urls;
use crate::commands::err_val;
use base64::{engine::general_purpose, Engine};
use serde_json::Value;

/// Default vision model. gpt-4.1 vision works on both consumer and enterprise
/// provider endpoints (gpt-4o vision is rejected on some enterprise proxies).
const DEFAULT_VISION_MODEL: &str = "gpt-4.1";

/// Tauri command: extract the URLs visible in a screenshot of browser tabs.
///
/// Accepts a data-URL (or bare base64) image, normalizes it to a flattened RGB
/// JPEG, and asks the vision model to return the absolute URLs it sees.
/// Returns `{ success: true, urls: [...] }` or `{ success: false, error }`.
#[tauri::command]
pub async fn cmd_previewer_extract_urls_from_image(
    image_data_url: String,
    model: Option<String>,
) -> Value {
    // Strip the `data:...;base64,` prefix (take everything after the first comma)
    // then base64-decode the payload.
    let payload = match image_data_url.split_once(',') {
        Some((_, rest)) => rest,
        None => image_data_url.as_str(),
    };
    let bytes = match general_purpose::STANDARD.decode(payload.trim()) {
        Ok(b) => b,
        Err(_) => return serde_json::json!({"success": false, "error": "Invalid image data."}),
    };

    // Normalize to a flattened RGB JPEG the vision proxy reliably accepts.
    let (jpeg, _mime) = match encode_image_for_vision(&bytes) {
        Ok(out) => out,
        Err(e) => return err_val(e),
    };
    let b64 = general_purpose::STANDARD.encode(&jpeg);
    let data_url = format!("data:image/jpeg;base64,{b64}");

    let model = model
        .filter(|m| !m.is_empty())
        .unwrap_or_else(|| DEFAULT_VISION_MODEL.to_string());

    match request_vision_urls(&data_url, &model).await {
        Ok(urls) => serde_json::json!({"success": true, "urls": urls}),
        Err(e) => err_val(e),
    }
}
