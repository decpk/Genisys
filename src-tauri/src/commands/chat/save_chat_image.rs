use base64::Engine;
use serde_json::Value;
use tauri::{AppHandle, Manager};

/// Persist a chat attachment image to `<app_data_dir>/chat-images/<uuid>.<ext>`.
///
/// Accepts EITHER:
/// - `data_url`: a `data:image/<fmt>;base64,...` string (e.g. from a clipboard paste), OR
/// - `source_path`: an absolute path to an existing image file (e.g. from the file picker).
///
/// Returns `{ success, filename, dataUrl }` where `filename` is the bare stored
/// filename to persist alongside the message, and `dataUrl` is a data URI suitable
/// for immediate preview in the UI.
#[tauri::command]
pub fn cmd_save_chat_image(
    app: AppHandle,
    data_url: Option<String>,
    source_path: Option<String>,
) -> Value {
    let data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };
    let images_dir = data_dir.join("chat-images");
    if let Err(e) = std::fs::create_dir_all(&images_dir) {
        return serde_json::json!({ "success": false, "error": format!("create dir: {e}") });
    }

    // Resolve the raw bytes + a file extension + a data URI for preview.
    let (bytes, ext, data_uri): (Vec<u8>, String, String) = if let Some(durl) = data_url {
        // Parse `data:<mime>;base64,<payload>`
        let (mime, payload) = match parse_data_url(&durl) {
            Some(v) => v,
            None => return serde_json::json!({ "success": false, "error": "invalid data URL" }),
        };
        let bytes = match base64::engine::general_purpose::STANDARD.decode(payload) {
            Ok(b) => b,
            Err(e) => return serde_json::json!({ "success": false, "error": format!("base64 decode: {e}") }),
        };
        let ext = mime_to_ext(mime);
        (bytes, ext, durl)
    } else if let Some(path) = source_path {
        let bytes = match std::fs::read(&path) {
            Ok(b) => b,
            Err(e) => return serde_json::json!({ "success": false, "error": format!("read source: {e}") }),
        };
        let ext = path
            .rsplit('.')
            .next()
            .filter(|e| !e.is_empty() && e.len() <= 5)
            .unwrap_or("png")
            .to_lowercase();
        let mime = ext_to_mime(&ext);
        let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
        let data_uri = format!("data:{mime};base64,{b64}");
        (bytes, ext, data_uri)
    } else {
        return serde_json::json!({ "success": false, "error": "no data_url or source_path provided" });
    };

    let filename = format!("{}.{}", uuid::Uuid::new_v4(), ext);
    let full_path = images_dir.join(&filename);
    if let Err(e) = std::fs::write(&full_path, &bytes) {
        return serde_json::json!({ "success": false, "error": format!("write: {e}") });
    }

    serde_json::json!({ "success": true, "filename": filename, "dataUrl": data_uri })
}

/// Split a `data:<mime>;base64,<payload>` URL into `(mime, payload)`.
fn parse_data_url(url: &str) -> Option<(&str, &str)> {
    let rest = url.strip_prefix("data:")?;
    let (meta, payload) = rest.split_once(',')?;
    let mime = meta.split(';').next().unwrap_or("image/png");
    Some((mime, payload))
}

fn mime_to_ext(mime: &str) -> String {
    match mime {
        "image/png" => "png",
        "image/jpeg" | "image/jpg" => "jpg",
        "image/gif" => "gif",
        "image/webp" => "webp",
        "image/bmp" => "bmp",
        "image/svg+xml" => "svg",
        _ => "png",
    }
    .to_string()
}

fn ext_to_mime(ext: &str) -> &'static str {
    match ext {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "svg" => "image/svg+xml",
        _ => "image/png",
    }
}
