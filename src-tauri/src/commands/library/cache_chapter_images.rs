use crate::commands::library::image_cache::{
    build_local_image_url, download_image, extension_from_content_type, extract_domain,
    extract_image_urls, get_book_screenshots_dir, get_chapter_sidecar_path, hash_url,
    read_images_sidecar, write_images_sidecar, CacheChapterImagesResult, CachedImageRecord,
    ImagesSidecar,
};
use chrono::Utc;
use reqwest::blocking::Client;
use std::collections::HashMap;
use std::fs;
use std::time::Duration;

/// Download every image referenced by `chapter_markdown`, persist it under
/// `<app_data_dir>/library/books/<book_id>/screenshots/`, and update the
/// chapter's `images.json` sidecar. Returns the full set of records (already
/// cached + newly fetched). Safe to call repeatedly — only missing files hit
/// the network.
#[tauri::command]
pub async fn cmd_cache_chapter_images(
    book_id: String,
    chapter_id: String,
    chapter_markdown: String,
) -> Result<CacheChapterImagesResult, String> {
    let urls = extract_image_urls(&chapter_markdown);
    let book_id_t = book_id.clone();
    let chapter_id_t = chapter_id.clone();

    let result: Result<Vec<CachedImageRecord>, String> = tokio::task::spawn_blocking(move || {
        let screenshots_dir = get_book_screenshots_dir(&book_id_t)?;
        let sidecar_path = get_chapter_sidecar_path(&book_id_t, &chapter_id_t)?;

        // Existing sidecar — keyed by url so we don't re-fetch what's already on disk.
        let existing: HashMap<String, CachedImageRecord> = read_images_sidecar(&sidecar_path)
            .map(|s| s.images.into_iter().map(|r| (r.url.clone(), r)).collect())
            .unwrap_or_default();

        let client = Client::builder()
            .timeout(Duration::from_secs(20))
            .build()
            .map_err(|e| format!("build http client: {e}"))?;

        let mut records: Vec<CachedImageRecord> = Vec::with_capacity(urls.len());

        for url in &urls {
            // Reuse cached record if file still exists on disk.
            if let Some(prev) = existing.get(url) {
                if prev.status == "ok" && !prev.local_file.is_empty() {
                    let file_path = screenshots_dir.join(&prev.local_file);
                    if file_path.exists() {
                        records.push(prev.clone());
                        continue;
                    }
                }
            }

            let now = Utc::now().to_rfc3339();
            let domain = extract_domain(url);

            match download_image(&client, url) {
                Ok((bytes, content_type)) => {
                    let ext = extension_from_content_type(&content_type);
                    let basename = hash_url(url);
                    let filename = format!("{basename}.{ext}");
                    let file_path = screenshots_dir.join(&filename);
                    if let Err(e) = fs::write(&file_path, &bytes) {
                        records.push(CachedImageRecord {
                            url: url.clone(),
                            local_file: String::new(),
                            local_url: String::new(),
                            content_type,
                            source_domain: domain,
                            size_bytes: 0,
                            status: "error".to_string(),
                            error: format!("write file: {e}"),
                            fetched_at: now,
                        });
                        continue;
                    }
                    records.push(CachedImageRecord {
                        url: url.clone(),
                        local_file: filename.clone(),
                        local_url: build_local_image_url(&book_id_t, &filename),
                        content_type,
                        source_domain: domain,
                        size_bytes: bytes.len() as u64,
                        status: "ok".to_string(),
                        error: String::new(),
                        fetched_at: now,
                    });
                }
                Err(e) => {
                    records.push(CachedImageRecord {
                        url: url.clone(),
                        local_file: String::new(),
                        local_url: String::new(),
                        content_type: String::new(),
                        source_domain: domain,
                        size_bytes: 0,
                        status: "error".to_string(),
                        error: e,
                        fetched_at: now,
                    });
                }
            }
        }

        let sidecar = ImagesSidecar {
            chapter_id: chapter_id_t.clone(),
            book_id: book_id_t.clone(),
            updated_at: Utc::now().to_rfc3339(),
            images: records.clone(),
        };
        write_images_sidecar(&sidecar_path, &sidecar)?;
        Ok(records)
    })
    .await
    .map_err(|e| format!("join blocking task: {e}"))?;

    Ok(CacheChapterImagesResult {
        images: result?,
    })
}
