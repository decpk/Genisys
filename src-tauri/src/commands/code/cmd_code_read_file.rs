use std::fs;
use std::path::PathBuf;

use serde_json::{json, Value};

use super::utils::{ensure_abs, looks_binary};

const MAX_FILE_SIZE: u64 = 5 * 1024 * 1024; // 5 MB

#[tauri::command]
pub async fn cmd_code_read_file(path: String) -> Value {
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
    if looks_binary(&bytes) {
        return json!({ "success": true, "data": { "binary": true, "size": meta.len() } });
    }
    match String::from_utf8(bytes) {
        Ok(content) => json!({
            "success": true,
            "data": { "binary": false, "content": content, "size": meta.len() }
        }),
        Err(_) => json!({ "success": true, "data": { "binary": true, "size": meta.len() } }),
    }
}
