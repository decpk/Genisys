use crate::helpers::get_data_dir;
use std::fs;

/// Recursively delete `<app_data_dir>/library/books/<book_id>/`. Called when a
/// book is removed so we don't leak gigabytes of cached images. Best-effort —
/// missing directories are ignored.
pub fn remove_book_dir(book_id: &str) {
    let safe_id = book_id.trim();
    if safe_id.is_empty() || safe_id.contains('/') || safe_id.contains('\\') || safe_id.contains("..") {
        return;
    }
    let dir = get_data_dir().join("library").join("books").join(safe_id);
    if dir.exists() {
        let _ = fs::remove_dir_all(&dir);
    }
}
