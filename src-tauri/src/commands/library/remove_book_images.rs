use crate::commands::library::image_cache::remove_book_dir;

/// Delete the entire on-disk cache for a book (screenshots + sidecars). Called
/// from the frontend and from `cmd_remove_book`. Best-effort — non-existing
/// directories are silently ignored.
#[tauri::command]
pub fn cmd_remove_book_images(book_id: String) -> serde_json::Value {
    remove_book_dir(&book_id);
    serde_json::json!({ "success": true })
}
