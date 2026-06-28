use crate::helpers::get_data_dir;
use std::path::PathBuf;

/// `<app_data_dir>/library/books/<book_id>/chapters/<chapter_id>/images.json` —
/// does NOT create the directory; that's the writer's responsibility.
pub fn get_chapter_sidecar_path(book_id: &str, chapter_id: &str) -> Result<PathBuf, String> {
    let safe_book = book_id.trim();
    let safe_chapter = chapter_id.trim();
    if safe_book.is_empty() || safe_book.contains('/') || safe_book.contains('\\') || safe_book.contains("..") {
        return Err(format!("invalid book_id: {book_id}"));
    }
    if safe_chapter.is_empty() || safe_chapter.contains('/') || safe_chapter.contains('\\') || safe_chapter.contains("..") {
        return Err(format!("invalid chapter_id: {chapter_id}"));
    }
    let path = get_data_dir()
        .join("library")
        .join("books")
        .join(safe_book)
        .join("chapters")
        .join(safe_chapter)
        .join("images.json");
    Ok(path)
}
