use crate::commands::library::image_cache::{
    extension_from_content_type, get_book_screenshots_dir,
};
use base64::Engine;
use std::fs;

/// Return a `data:` URL for a cached image. Used by exporters that need to
/// inline images (single-file HTML, PDF, etc.) since they cannot rely on the
/// `library-image://` scheme at consumption time.
#[tauri::command]
pub fn cmd_load_cached_image_as_data_url(
    book_id: String,
    filename: String,
) -> Result<String, String> {
    if filename.contains('/') || filename.contains('\\') || filename.contains("..") {
        return Err(format!("invalid filename: {filename}"));
    }
    let dir = get_book_screenshots_dir(&book_id)?;
    let path = dir.join(&filename);
    let bytes = fs::read(&path).map_err(|e| format!("read cached image: {e}"))?;

    // Guess mime from extension; default to octet-stream.
    let ext = filename.rsplit('.').next().unwrap_or("").to_ascii_lowercase();
    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "avif" => "image/avif",
        "bmp" => "image/bmp",
        "tiff" => "image/tiff",
        _ => {
            // Reuse the content-type → ext map in reverse via a default.
            let _ = extension_from_content_type;
            "application/octet-stream"
        }
    };

    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{mime};base64,{encoded}"))
}
