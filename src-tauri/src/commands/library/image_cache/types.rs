use serde::{Deserialize, Serialize};

/// One entry in a chapter's `images.json` sidecar — describes a single cached image.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedImageRecord {
    /// Original remote URL the AI emitted (`https://upload.wikimedia.org/...`).
    pub url: String,
    /// Filename inside `<app_data_dir>/library/books/<book_id>/screenshots/`.
    /// Empty when `status != "ok"`.
    pub local_file: String,
    /// Resolved `library-image://<book_id>/<local_file>` URL the renderer should use.
    /// Empty when `status != "ok"`.
    pub local_url: String,
    /// MIME content-type (e.g. `image/jpeg`). Empty on failure.
    pub content_type: String,
    /// Domain extracted from `url` (e.g. `upload.wikimedia.org`).
    pub source_domain: String,
    /// File size in bytes. `0` on failure.
    pub size_bytes: u64,
    /// `"ok"` when the file is on disk; `"error"` when the download failed.
    pub status: String,
    /// Failure reason when `status == "error"`. Empty otherwise.
    pub error: String,
    /// ISO-8601 timestamp of when the entry was last written.
    pub fetched_at: String,
}

/// Top-level shape of `images.json`.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImagesSidecar {
    pub chapter_id: String,
    pub book_id: String,
    pub updated_at: String,
    pub images: Vec<CachedImageRecord>,
}

/// Returned by `cmd_cache_chapter_images` — keyed by original URL.
#[derive(Debug, Clone, Serialize)]
pub struct CacheChapterImagesResult {
    pub images: Vec<CachedImageRecord>,
}
