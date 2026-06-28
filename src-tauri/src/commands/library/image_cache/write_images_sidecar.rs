use super::types::ImagesSidecar;
use std::fs;
use std::path::Path;

/// Write `images.json` for a chapter. Creates the parent directory if missing.
pub fn write_images_sidecar(path: &Path, sidecar: &ImagesSidecar) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("create sidecar dir: {e}"))?;
    }
    let json = serde_json::to_string_pretty(sidecar).map_err(|e| format!("serialize sidecar: {e}"))?;
    fs::write(path, json).map_err(|e| format!("write sidecar: {e}"))
}
