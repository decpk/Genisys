//! `search_images` tool — barrel re-exporting the public entry points.
//!
//! The actual implementation is split into one-function-per-file modules
//! under `search_images/` for reusability and testability.

pub mod build_image_search_client;
pub mod build_wikimedia_search_url;
pub mod fetch_wikimedia_image_info;
pub mod search_images_wikimedia;
pub mod types;

pub use search_images_wikimedia::search_images_wikimedia;
