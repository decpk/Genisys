use crate::commands::err_val;
use crate::types::BrowserBookmark;
use serde_json::Value;

#[tauri::command]
pub fn cmd_import_browser_bookmarks(browser: String, profile_path: String) -> Value {
    let parsed: Result<Vec<BrowserBookmark>, String> = match browser.as_str() {
        "chrome" | "edge" | "brave" => super::parse_chromium_bookmarks(&profile_path),
        "firefox" => super::parse_firefox_bookmarks(&profile_path),
        "safari" => super::parse_safari_bookmarks(&profile_path),
        other => Err(format!("Unsupported browser: {other}")),
    };
    match parsed {
        Ok(bookmarks) => serde_json::json!({ "success": true, "bookmarks": bookmarks }),
        Err(e) => err_val(e),
    }
}
