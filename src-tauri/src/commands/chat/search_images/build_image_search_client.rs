//! Construct a configured blocking HTTP client used by the image search tool.
//!
//! Extracted into its own file so multiple search backends can share the
//! exact same transport configuration (timeouts, compression, UA).

use std::time::Duration;

/// Build a reqwest blocking client tuned for talking to Wikimedia / image
/// search APIs. Short timeout (15s) keeps the LLM tool loop snappy.
pub fn build_image_search_client() -> Result<reqwest::blocking::Client, String> {
    reqwest::blocking::Client::builder()
        .user_agent("Genisys/1.0 (library-image-search; +https://example.com)")
        .timeout(Duration::from_secs(15))
        .redirect(reqwest::redirect::Policy::limited(5))
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))
}
