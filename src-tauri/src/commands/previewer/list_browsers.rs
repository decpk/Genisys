use crate::types::BrowserApp;
use serde_json::Value;
use std::path::PathBuf;

use super::browser_catalog::browser_catalog;

/// Directories that hold `.app` bundles on macOS.
fn application_dirs() -> Vec<PathBuf> {
    let mut dirs = vec![PathBuf::from("/Applications")];
    if let Some(home) = dirs::home_dir() {
        dirs.push(home.join("Applications"));
    }
    dirs
}

/// True if `<app_name>.app` exists in any known Applications directory.
fn is_installed(app_name: &str) -> bool {
    let bundle = format!("{app_name}.app");
    application_dirs().iter().any(|dir| dir.join(&bundle).exists())
}

/// List installed browsers Genisys can open URLs in. macOS-only detection; other
/// platforms return an empty list and the frontend falls back to the system
/// default browser.
#[tauri::command]
pub fn cmd_list_browsers() -> Value {
    let mut browsers: Vec<BrowserApp> = Vec::new();
    if cfg!(target_os = "macos") {
        for entry in browser_catalog() {
            if is_installed(entry.app_name) {
                browsers.push(BrowserApp {
                    id: entry.id.to_string(),
                    name: entry.name.to_string(),
                    app_name: entry.app_name.to_string(),
                });
            }
        }
    }
    serde_json::json!({ "success": true, "browsers": browsers })
}
