use base64::Engine;
use serde_json::Value;
use tauri::{AppHandle, Manager};

/// Read a stored chat attachment image and return it as a base64 data URI for
/// display. `filename` must be a bare filename (no path separators) previously
/// returned by `cmd_save_chat_image`.
#[tauri::command]
pub fn cmd_get_chat_image(app: AppHandle, filename: String) -> Value {
    if let Err(e) = validate_filename(&filename) {
        return serde_json::json!({ "success": false, "error": e });
    }

    let data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };
    let full_path = data_dir.join("chat-images").join(&filename);

    match std::fs::read(&full_path) {
        Ok(bytes) => {
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            let mime = ext_mime(&filename);
            let data_url = format!("data:{mime};base64,{b64}");
            serde_json::json!({ "success": true, "dataUrl": data_url })
        }
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}

/// Reject anything that could escape the `chat-images/` directory.
fn validate_filename(filename: &str) -> Result<(), String> {
    if filename.is_empty() {
        return Err("filename is empty".to_string());
    }
    if filename.contains('/') || filename.contains('\\') {
        return Err("filename must not contain path separators".to_string());
    }
    if filename.contains("..") {
        return Err("filename must not contain '..'".to_string());
    }
    if filename.starts_with('.') {
        return Err("filename must not start with '.'".to_string());
    }
    Ok(())
}

fn ext_mime(filename: &str) -> &'static str {
    match filename.rsplit('.').next().unwrap_or("").to_lowercase().as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "svg" => "image/svg+xml",
        _ => "image/png",
    }
}
