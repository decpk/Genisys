/**
 * One entry in a chapter's offline image cache. Mirrors the Rust
 * `CachedImageRecord` struct returned by `cmd_cache_chapter_images` and
 * `cmd_load_chapter_images`.
 */
export interface CachedImageRecord {
  /** Original remote URL the AI emitted. */
  url: string;
  /** Filename inside `<app_data_dir>/library/books/<book_id>/screenshots/`. */
  local_file: string;
  /** Renderer-facing URL: `library-image://<book_id>/<local_file>`. */
  local_url: string;
  /** MIME content-type. */
  content_type: string;
  /** Source domain (e.g. `upload.wikimedia.org`). */
  source_domain: string;
  /** File size in bytes. */
  size_bytes: number;
  /** `"ok"` when the file is on disk; `"error"` when the download failed. */
  status: "ok" | "error";
  /** Failure reason when status is `"error"`. */
  error: string;
  /** ISO-8601 timestamp. */
  fetched_at: string;
}
