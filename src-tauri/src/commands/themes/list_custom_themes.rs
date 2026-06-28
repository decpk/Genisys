use std::fs;

use serde_json::Value;

use super::themes_dir::themes_dir;

/// Returns every parseable user-defined theme JSON file from the themes directory.
///
/// Themes are returned as opaque JSON values so the frontend `Theme` type remains
/// the single source of truth. Invalid or unparseable files are skipped (and logged
/// to stderr) rather than failing the whole call.
#[tauri::command]
pub fn cmd_list_custom_themes() -> Vec<Value> {
    let dir = themes_dir();
    let entries = match fs::read_dir(&dir) {
        Ok(entries) => entries,
        Err(_) => return Vec::new(),
    };

    let mut themes: Vec<Value> = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) != Some("json") {
            continue;
        }
        if path.file_name().and_then(|s| s.to_str()).is_some_and(|n| n.ends_with(".tmp.json")) {
            continue;
        }
        match fs::read_to_string(&path) {
            Ok(content) => match serde_json::from_str::<Value>(&content) {
                Ok(value) => themes.push(value),
                Err(err) => eprintln!("[themes] failed to parse {}: {err}", path.display()),
            },
            Err(err) => eprintln!("[themes] failed to read {}: {err}", path.display()),
        }
    }
    themes
}
