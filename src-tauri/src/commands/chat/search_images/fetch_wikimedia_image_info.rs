//! Parse a single Wikimedia `query.pages[]` entry into an `ImageSearchResult`.
//!
//! Kept as its own function so we can unit-test JSON shape variants
//! independently of any network code.

use serde_json::Value;
use url::Url;

use super::types::ImageSearchResult;

/// Convert a single Wikimedia page object (with `imageinfo` populated) into
/// a normalized `ImageSearchResult`. Returns `None` if the page is missing
/// required fields (e.g. no image URL).
pub fn fetch_wikimedia_image_info(page: &Value) -> Option<ImageSearchResult> {
    let title = page
        .get("title")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let imageinfo = page.get("imageinfo")?.as_array()?;
    let info = imageinfo.first()?;

    // Prefer the resized thumb (800px wide) when available; otherwise fall
    // back to the full-resolution URL. The model gets a single direct URL
    // it can embed in markdown.
    let url = info
        .get("thumburl")
        .and_then(|v| v.as_str())
        .or_else(|| info.get("url").and_then(|v| v.as_str()))?
        .to_string();

    let descriptionurl = info
        .get("descriptionurl")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let width = info
        .get("thumbwidth")
        .or_else(|| info.get("width"))
        .and_then(|v| v.as_u64())
        .map(|v| v as u32);

    let height = info
        .get("thumbheight")
        .or_else(|| info.get("height"))
        .and_then(|v| v.as_u64())
        .map(|v| v as u32);

    // extmetadata.LicenseShortName.value is the canonical license blurb
    let license = info
        .get("extmetadata")
        .and_then(|m| m.get("LicenseShortName"))
        .and_then(|l| l.get("value"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let domain = Url::parse(&url)
        .ok()
        .and_then(|u| u.host_str().map(|s| s.to_string()))
        .unwrap_or_default();

    Some(ImageSearchResult {
        url,
        title,
        descriptionurl,
        source: "Wikimedia Commons".to_string(),
        domain,
        width,
        height,
        license,
    })
}
