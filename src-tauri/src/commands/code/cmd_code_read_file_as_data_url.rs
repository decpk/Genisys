use std::fs;
use std::path::PathBuf;

use base64::Engine;
use serde_json::{json, Value};

use super::utils::ensure_abs;

const MAX_FILE_SIZE: u64 = 25 * 1024 * 1024; // 25 MB

fn mime_type_from_ext(ext: &str) -> &'static str {
    match ext {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "ico" => "image/x-icon",
        "svg" => "image/svg+xml",
        _ => "application/octet-stream",
    }
}

#[tauri::command]
pub async fn cmd_code_read_file_as_data_url(path: String) -> Value {
    let abs = PathBuf::from(&path);
    if let Err(e) = ensure_abs(&abs) {
        return json!({ "success": false, "error": e });
    }
    let meta = match fs::metadata(&abs) {
        Ok(m) => m,
        Err(e) => return json!({ "success": false, "error": e.to_string() }),
    };
    if !meta.is_file() {
        return json!({ "success": false, "error": "Not a file" });
    }
    if meta.len() > MAX_FILE_SIZE {
        return json!({
            "success": false,
            "error": format!("File too large ({} bytes); max {} bytes", meta.len(), MAX_FILE_SIZE)
        });
    }
    let bytes = match fs::read(&abs) {
        Ok(b) => b,
        Err(e) => return json!({ "success": false, "error": e.to_string() }),
    };

    let ext = abs
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let mime = mime_type_from_ext(&ext);
    let size_bytes = bytes.len() as u64;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);

    json!({
        "success": true,
        "data": {
            "dataUrl": format!("data:{mime};base64,{b64}"),
            "mimeType": mime,
            "sizeBytes": size_bytes,
        }
    })
}
