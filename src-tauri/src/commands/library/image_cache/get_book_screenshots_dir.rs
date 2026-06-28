use crate::helpers::get_data_dir;
use std::fs;
use std::path::PathBuf;

/// `<app_data_dir>/library/books/<book_id>/screenshots/` — creates the directory
/// if it does not exist yet.
pub fn get_book_screenshots_dir(book_id: &str) -> Result<PathBuf, String> {
    let safe_id = book_id.trim();
    if safe_id.is_empty() || safe_id.contains('/') || safe_id.contains('\\') || safe_id.contains("..") {
        return Err(format!("invalid book_id: {book_id}"));
    }
    let dir = get_data_dir()
        .join("library")
        .join("books")
        .join(safe_id)
        .join("screenshots");
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create screenshots dir: {e}"))?;
    Ok(dir)
}
