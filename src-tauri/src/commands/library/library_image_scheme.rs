use crate::commands::library::image_cache::get_book_screenshots_dir;
use std::borrow::Cow;
use std::fs;
use tauri::http::{Request, Response};

/// Handler registered for the `library-image://` URI scheme. Resolves
/// `library-image://<book_id>/<filename>` to the bytes of the cached image
/// on disk. Used by the markdown renderer to display offline-cached images
/// without expensive base64 round-trips through JSON.
pub fn handle_library_image_request<R: tauri::Runtime>(
    _ctx: tauri::UriSchemeContext<'_, R>,
    request: Request<Vec<u8>>,
) -> Response<Cow<'static, [u8]>> {
    let uri = request.uri().to_string();
    let (book_id, filename) = match parse_uri(&uri) {
        Some(parts) => parts,
        None => return error_response(400, b"invalid uri"),
    };

    if filename.contains("..") || filename.contains('/') || filename.contains('\\') {
        return error_response(400, b"invalid filename");
    }

    let dir = match get_book_screenshots_dir(&book_id) {
        Ok(d) => d,
        Err(_) => return error_response(400, b"invalid book id"),
    };

    let path = dir.join(&filename);
    match fs::read(&path) {
        Ok(bytes) => Response::builder()
            .status(200)
            .header("Content-Type", guess_mime(&filename))
            .header("Cache-Control", "private, max-age=3600")
            .body(Cow::Owned(bytes))
            .unwrap(),
        Err(_) => error_response(404, b"not found"),
    }
}

/// `library-image://<book_id>/<filename>` → `(book_id, filename)`.
/// On Windows webviews Tauri rewrites the URI as
/// `https://library-image.localhost/<book_id>/<filename>`, so we accept both.
fn parse_uri(uri: &str) -> Option<(String, String)> {
    let stripped = uri
        .strip_prefix("library-image://")
        .or_else(|| uri.strip_prefix("https://library-image.localhost/"))
        .or_else(|| uri.strip_prefix("http://library-image.localhost/"))?;
    let path = stripped.split(['?', '#']).next().unwrap_or("");
    let mut parts = path.splitn(2, '/');
    let book_id_raw = parts.next()?;
    let filename_raw = parts.next()?;
    if book_id_raw.is_empty() || filename_raw.is_empty() {
        return None;
    }
    // Percent-decode each segment via the `url` crate so unicode book ids work.
    let book_id = decode_segment(book_id_raw);
    let filename = decode_segment(filename_raw);
    Some((book_id, filename))
}

fn decode_segment(segment: &str) -> String {
    // Reuse url::Url's path-segment percent decoder by parsing a throwaway URL.
    url::Url::parse(&format!("http://x/{segment}"))
        .ok()
        .and_then(|u| {
            u.path_segments()
                .and_then(|mut s| s.next().map(|s| s.to_string()))
        })
        .unwrap_or_else(|| segment.to_string())
}

fn guess_mime(filename: &str) -> &'static str {
    let ext = filename.rsplit('.').next().unwrap_or("").to_ascii_lowercase();
    match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "avif" => "image/avif",
        "bmp" => "image/bmp",
        "tiff" => "image/tiff",
        _ => "application/octet-stream",
    }
}

fn error_response(status: u16, body: &'static [u8]) -> Response<Cow<'static, [u8]>> {
    Response::builder()
        .status(status)
        .header("Content-Type", "text/plain")
        .body(Cow::Borrowed(body))
        .unwrap()
}
