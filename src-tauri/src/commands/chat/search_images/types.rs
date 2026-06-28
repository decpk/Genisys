//! Shared types for the `search_images` tool.

use serde::{Deserialize, Serialize};

/// One image result returned to the LLM. Field names mirror what the
/// model receives in the tool response.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSearchResult {
    /// Direct URL to the image file (this is what gets embedded in markdown).
    pub url: String,
    /// Display title or filename for the image.
    pub title: String,
    /// Page on the source site that hosts the image (good for the Source line).
    pub descriptionurl: String,
    /// Original publisher / source name (e.g. "Wikimedia Commons").
    pub source: String,
    /// Host of `url` — useful for the markdown `*Source: ... — [<domain>](url)*` line.
    pub domain: String,
    /// Pixel width if known, else `None`.
    pub width: Option<u32>,
    /// Pixel height if known, else `None`.
    pub height: Option<u32>,
    /// License or attribution text if returned by the upstream API.
    pub license: Option<String>,
}
