use crate::database::{update_clipboard_image_description_db, update_clipboard_extracted_text_db, Database};
use crate::ai_provider::resolve_provider;
use base64::{engine::general_purpose, Engine};
use serde_json::Value;
use std::path::Path;
use std::sync::Arc;
use tauri::{Emitter, Manager};

use crate::prompts::vision_system_prompt::VISION_SYSTEM_PROMPT;

/// Default vision model. gpt-4.1 vision works across the common OpenAI-compatible
/// providers (gpt-4o vision is rejected on some enterprise proxies).
const DEFAULT_VISION_MODEL: &str = "gpt-4.1";

/// Run image analysis using a vision-capable model via the configured AI provider.
/// `model` is the user-selected vision model (falls back to gpt-4.1 when empty).
/// Called from the clipboard monitor thread after saving an image.
pub async fn run_image_analysis(
    db: &Arc<Database>,
    app_handle: &tauri::AppHandle,
    item_id: &str,
    image_path: &Path,
    model: &str,
) {
    println!(
        "[clipboard] >>> starting image analysis for item {item_id} (path: {})",
        image_path.display()
    );
    let raw_content = match analyze_image_with_vision(image_path, model).await {
        Ok(content) => content,
        Err(e) => {
            println!("[clipboard] !!! image analysis FAILED for {item_id}: {e}");
            eprintln!("[clipboard] image analysis failed for {item_id}: {e}");
            // Also persist the failure reason to a debug log file we can read later.
            if let Ok(dir) = app_handle.path().app_data_dir() {
                let log_path = dir.join("clipboard-analysis-debug.log");
                let line = format!(
                    "[{}] item={item_id} path={} ERROR: {e}\n",
                    chrono::Local::now().to_rfc3339(),
                    image_path.display()
                );
                use std::io::Write;
                if let Ok(mut f) = std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&log_path)
                {
                    let _ = f.write_all(line.as_bytes());
                }
            }
            update_clipboard_image_description_db(db, item_id, "", "failed");
            let _ = app_handle.emit(
                "clipboard-image-analyzed",
                serde_json::json!({
                    "itemId": item_id,
                    "description": Value::Null,
                    "extractedText": Value::Null,
                    "analysisStatus": "failed",
                    "error": e,
                }),
            );
            return;
        }
    };
    println!("[clipboard] <<< vision call OK for {item_id} ({} chars)", raw_content.len());

    // Try to parse as structured JSON { description, extractedText }
    let (description, extracted_text) = parse_vision_response(&raw_content);

    update_clipboard_image_description_db(db, item_id, &description, "done");
    if let Some(ref text) = extracted_text {
        update_clipboard_extracted_text_db(db, item_id, text);
    }

    let _ = app_handle.emit(
        "clipboard-image-analyzed",
        serde_json::json!({
            "itemId": item_id,
            "description": description,
            "extractedText": extracted_text,
            "analysisStatus": "done",
        }),
    );
}

/// Parse the vision model response. Tries JSON first, falls back to plain text as description.
fn parse_vision_response(raw: &str) -> (String, Option<String>) {
    // Try parsing as JSON
    if let Ok(parsed) = serde_json::from_str::<Value>(raw) {
        let description = parsed["description"]
            .as_str()
            .unwrap_or("")
            .to_string();
        let extracted_text = parsed["extractedText"]
            .as_str()
            .map(|s| s.to_string())
            .filter(|s| !s.is_empty());
        if !description.is_empty() {
            return (description, extracted_text);
        }
    }

    // Try stripping markdown code fences (```json ... ```)
    let trimmed = raw.trim();
    if trimmed.starts_with("```") {
        let inner = trimmed
            .trim_start_matches("```json")
            .trim_start_matches("```")
            .trim_end_matches("```")
            .trim();
        if let Ok(parsed) = serde_json::from_str::<Value>(inner) {
            let description = parsed["description"]
                .as_str()
                .unwrap_or("")
                .to_string();
            let extracted_text = parsed["extractedText"]
                .as_str()
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty());
            if !description.is_empty() {
                return (description, extracted_text);
            }
        }
    }

    // Fallback: treat entire response as description (backward compat)
    (raw.to_string(), None)
}

/// Decode arbitrary image bytes and re-encode them as a flattened RGB JPEG that
/// the vision endpoint accepts. Alpha is composited over a white
/// background and the image is downscaled so neither dimension exceeds 2048px
/// (matching the limit the model uses internally). Returns `(jpeg_bytes, mime)`.
fn encode_image_for_vision(bytes: &[u8]) -> Result<(Vec<u8>, &'static str), String> {
    use image::{imageops::FilterType, GenericImageView};

    let img = image::load_from_memory(bytes).map_err(|e| format!("decode failed: {e}"))?;

    // Downscale to a 2048px bound to keep the payload within model limits.
    const MAX_DIM: u32 = 2048;
    let (w, h) = img.dimensions();
    let img = if w > MAX_DIM || h > MAX_DIM {
        img.resize(MAX_DIM, MAX_DIM, FilterType::Triangle)
    } else {
        img
    };

    // Flatten any alpha over a white background, then drop the alpha channel.
    let rgba = img.to_rgba8();
    let (w, h) = rgba.dimensions();
    let mut rgb = image::RgbImage::new(w, h);
    for (x, y, px) in rgba.enumerate_pixels() {
        let [r, g, b, a] = px.0;
        let a = a as f32 / 255.0;
        let blend = |c: u8| -> u8 { (c as f32 * a + 255.0 * (1.0 - a)).round() as u8 };
        rgb.put_pixel(x, y, image::Rgb([blend(r), blend(g), blend(b)]));
    }

    let mut out = std::io::Cursor::new(Vec::new());
    image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, 85)
        .encode_image(&image::DynamicImage::ImageRgb8(rgb))
        .map_err(|e| format!("encode failed: {e}"))?;
    Ok((out.into_inner(), "image/jpeg"))
}

async fn analyze_image_with_vision(image_path: &Path, model: &str) -> Result<String, String> {
    let provider = resolve_provider(model)?;
    let ct = provider.api_key;
    let ep = provider.base_url;

    if !image_path.exists() {
        return Err(format!("Image file does not exist: {}", image_path.display()));
    }
    let bytes = std::fs::read(image_path).map_err(|e| format!("Failed to read image: {e}"))?;
    println!("[clipboard] read image: {} bytes", bytes.len());

    // Normalize the image before sending to the vision endpoint.
    // Screenshots on macOS/Windows are RGBA PNGs; the vision proxy rejects those
    // with "image media type not supported". Re-encoding to a flattened RGB JPEG
    // (alpha composited over white) and downscaling to a 2048px bound produces a
    // payload the validator reliably accepts. Falls back to the raw bytes if
    // decoding fails for any reason.
    let (b64, mime) = match encode_image_for_vision(&bytes) {
        Ok((jpeg_bytes, m)) => {
            println!(
                "[clipboard] re-encoded image -> {} ({} bytes)",
                m,
                jpeg_bytes.len()
            );
            (general_purpose::STANDARD.encode(&jpeg_bytes), m)
        }
        Err(e) => {
            println!("[clipboard] re-encode failed ({e}); falling back to raw bytes");
            let ext = image_path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png");
            let m = match ext {
                "jpg" | "jpeg" => "image/jpeg",
                "gif" => "image/gif",
                "webp" => "image/webp",
                _ => "image/png",
            };
            (general_purpose::STANDARD.encode(&bytes), m)
        }
    };
    let data_url = format!("data:{mime};base64,{b64}");

    let client = reqwest::Client::new();

    let body = serde_json::json!({
        // Vision model is user-configurable (Settings → Clipboard). Defaults to
        // gpt-4.1, which works on both consumer and enterprise provider endpoints
        // (gpt-4o vision is rejected on some enterprise proxies).
        "model": model,
        "messages": [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this clipboard image. Return JSON with description and extractedText."},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ],
        "stream": false,
        "temperature": 0.1,
        "max_tokens": 1000,
    });

    let resp = client
        .post(format!("{ep}/chat/completions"))
        .header("Authorization", format!("Bearer {ct}"))
        .header("Content-Type", "application/json")
        .header("User-Agent", "Genisys")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = resp.status();
    println!("[clipboard] vision endpoint responded: HTTP {}", status.as_u16());
    if !status.is_success() {
        let st = status.as_u16();
        let body_text = resp.text().await.unwrap_or_default();
        return Err(format!("HTTP {st}: {body_text}"));
    }

    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    if content.is_empty() {
        return Err("Empty response from vision model".to_string());
    }

    Ok(content)
}

/// Tauri command: analyze a clipboard image (or retry a failed one)
#[tauri::command]
pub async fn cmd_analyze_clipboard_image(
    app: tauri::AppHandle,
    item_id: String,
    image_path: String,
    model: Option<String>,
) -> Value {
    let state = app.state::<crate::commands::AppState>();
    let db = state.db.clone();

    let images_dir = app
        .path()
        .app_data_dir()
        .expect("app data dir")
        .join("clipboard-images");
    let full_path = images_dir.join(&image_path);

    let model = model
        .filter(|m| !m.trim().is_empty())
        .unwrap_or_else(|| DEFAULT_VISION_MODEL.to_string());

    // Set status to pending
    update_clipboard_image_description_db(&db, &item_id, "", "pending");

    run_image_analysis(&db, &app, &item_id, &full_path, &model).await;

    serde_json::json!({"success": true})
}
