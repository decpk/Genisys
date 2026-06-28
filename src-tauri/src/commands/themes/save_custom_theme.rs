use std::fs;

use serde_json::Value;

use super::is_valid_theme_id::is_valid_theme_id;
use super::themes_dir::themes_dir;

/// Persists a custom theme as `<id>.json` inside the themes directory.
///
/// Performs an atomic write via a `<id>.tmp.json` staging file followed by `rename`
/// so concurrent readers never observe a partially-written file. The `id` is
/// validated to prevent path traversal.
#[tauri::command]
pub fn cmd_save_custom_theme(theme: Value) -> Result<(), String> {
    let id = theme
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Theme id is required".to_string())?
        .to_string();

    if !is_valid_theme_id(&id) {
        return Err(format!("Invalid theme id: {id}"));
    }

    let dir = themes_dir();
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create themes dir: {e}"))?;

    let final_path = dir.join(format!("{id}.json"));
    let tmp_path = dir.join(format!("{id}.tmp.json"));

    let json = serde_json::to_string_pretty(&theme)
        .map_err(|e| format!("Failed to serialize theme: {e}"))?;

    fs::write(&tmp_path, &json)
        .map_err(|e| format!("Failed to write theme tmp file: {e}"))?;
    if let Err(e) = fs::rename(&tmp_path, &final_path) {
        let _ = fs::remove_file(&tmp_path);
        return Err(format!("Failed to commit theme file: {e}"));
    }
    Ok(())
}
