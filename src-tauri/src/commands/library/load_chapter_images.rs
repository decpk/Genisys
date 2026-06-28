use crate::commands::library::image_cache::{
    get_chapter_sidecar_path, read_images_sidecar, CachedImageRecord,
};

/// Frontend-facing reader for a chapter's `images.json`. Returns an empty list
/// if the sidecar does not exist yet (chapter was generated before image
/// caching was wired up or no images were found).
#[tauri::command]
pub fn cmd_load_chapter_images(
    book_id: String,
    chapter_id: String,
) -> Result<Vec<CachedImageRecord>, String> {
    let path = get_chapter_sidecar_path(&book_id, &chapter_id)?;
    Ok(read_images_sidecar(&path)
        .map(|s| s.images)
        .unwrap_or_default())
}
