use super::types::ImagesSidecar;
use std::path::Path;
use std::fs;

/// Read and parse `images.json` for a chapter. Returns `None` if the file is
/// absent or unparseable (treated as "no cache yet").
pub fn read_images_sidecar(path: &Path) -> Option<ImagesSidecar> {
    if !path.exists() {
        return None;
    }
    let raw = fs::read_to_string(path).ok()?;
    serde_json::from_str(&raw).ok()
}
