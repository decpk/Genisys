use std::fs;

use super::is_valid_theme_id::is_valid_theme_id;
use super::themes_dir::themes_dir;

/// Removes a custom theme JSON file. Idempotent: returns Ok if the file was
/// already absent.
#[tauri::command]
pub fn cmd_delete_custom_theme(id: String) -> Result<(), String> {
    if !is_valid_theme_id(&id) {
        return Err(format!("Invalid theme id: {id}"));
    }
    let path = themes_dir().join(format!("{id}.json"));
    if !path.exists() {
        return Ok(());
    }
    fs::remove_file(&path).map_err(|e| format!("Failed to delete theme: {e}"))
}
