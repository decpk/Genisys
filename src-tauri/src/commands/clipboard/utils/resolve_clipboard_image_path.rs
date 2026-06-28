use std::path::PathBuf;
use tauri::{AppHandle, Manager};

use super::validate_clipboard_filename::validate_clipboard_filename;

/// Resolve a stored clipboard image filename to its absolute path on disk
/// under `<app_data_dir>/clipboard-images/<filename>`.
///
/// Returns an error if the filename fails validation or the app data
/// directory cannot be located.
pub fn resolve_clipboard_image_path(
    app: &AppHandle,
    filename: &str,
) -> Result<PathBuf, String> {
    validate_clipboard_filename(filename)?;
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("failed to resolve app data dir: {e}"))?;
    Ok(data_dir.join("clipboard-images").join(filename))
}
