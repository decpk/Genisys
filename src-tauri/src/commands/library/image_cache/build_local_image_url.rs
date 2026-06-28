/// Returns the renderer-facing URL for a cached image. The custom URI scheme
/// `library-image://<book_id>/<filename>` is resolved by the protocol handler
/// registered in `lib.rs`.
pub fn build_local_image_url(book_id: &str, filename: &str) -> String {
    format!("library-image://{book_id}/{filename}")
}
