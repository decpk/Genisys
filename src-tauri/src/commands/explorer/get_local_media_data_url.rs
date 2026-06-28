use crate::commands::err_val;
use base64::Engine;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_get_local_media_data_url(root_path: String, file_path: String) -> Value {
    let full = PathBuf::from(&root_path).join(file_path.trim_start_matches('/'));
    let ext = full.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();
    let mime = match ext.as_str() {
        "png"=>"image/png","jpg"|"jpeg"=>"image/jpeg","gif"=>"image/gif","webp"=>"image/webp",
        "svg"=>"image/svg+xml","ico"=>"image/x-icon","bmp"=>"image/bmp",
        "mp4"=>"video/mp4","webm"=>"video/webm","ogg"=>"video/ogg","mov"=>"video/quicktime",
        "mp3"=>"audio/mpeg","wav"=>"audio/wav","flac"=>"audio/flac","aac"=>"audio/aac",
        _=>"application/octet-stream",
    };
    match fs::read(&full) {
        Ok(bytes) if bytes.len() > 50*1024*1024 => err_val("File too large (>50MB)"),
        Ok(bytes) => serde_json::json!({"success": true, "dataUrl": format!("data:{mime};base64,{}", base64::engine::general_purpose::STANDARD.encode(&bytes))}),
        Err(e) => err_val(e),
    }
}
