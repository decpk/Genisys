use crate::types::BrowserBookmarkSource;
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

/// (browser id, display name, macOS subpath, Windows subpath, Linux subpath)
const CHROMIUM_BROWSERS: &[(&str, &str, &str, &str, &str)] = &[
    ("chrome", "Chrome", "Google/Chrome", "Google/Chrome/User Data", "google-chrome"),
    (
        "brave",
        "Brave",
        "BraveSoftware/Brave-Browser",
        "BraveSoftware/Brave-Browser/User Data",
        "BraveSoftware/Brave-Browser",
    ),
];

/// Resolve the per-platform base directory that holds a Chromium browser's
/// profile folders.
fn chromium_base(home: &Path, mac: &str, win: &str, linux: &str) -> PathBuf {
    if cfg!(target_os = "macos") {
        home.join("Library/Application Support").join(mac)
    } else if cfg!(target_os = "windows") {
        home.join("AppData/Local").join(win)
    } else {
        home.join(".config").join(linux)
    }
}

/// Detect Chromium-family browsers: any profile subdir containing a `Bookmarks` file.
fn push_chromium_sources(home: &Path, out: &mut Vec<BrowserBookmarkSource>) {
    for (id, display, mac, win, linux) in CHROMIUM_BROWSERS {
        let base = chromium_base(home, mac, win, linux);
        let entries = match fs::read_dir(&base) {
            Ok(entries) => entries,
            Err(_) => continue,
        };
        for entry in entries.flatten() {
            let dir = entry.path();
            if !dir.is_dir() {
                continue;
            }
            let bookmarks = dir.join("Bookmarks");
            if !bookmarks.exists() {
                continue;
            }
            let profile = entry.file_name().to_string_lossy().to_string();
            out.push(BrowserBookmarkSource {
                browser: (*id).to_string(),
                profile: profile.clone(),
                label: format!("{display} — {profile}"),
                path: bookmarks.to_string_lossy().to_string(),
            });
        }
    }
}

/// Resolve the per-platform Firefox `Profiles` directory.
fn firefox_profiles_dir(home: &Path) -> PathBuf {
    if cfg!(target_os = "macos") {
        home.join("Library/Application Support/Firefox/Profiles")
    } else if cfg!(target_os = "windows") {
        home.join("AppData/Roaming/Mozilla/Firefox/Profiles")
    } else {
        home.join(".mozilla/firefox")
    }
}

/// Detect Firefox profiles: any subdir containing a `places.sqlite` file.
fn push_firefox_sources(home: &Path, out: &mut Vec<BrowserBookmarkSource>) {
    let base = firefox_profiles_dir(home);
    let entries = match fs::read_dir(&base) {
        Ok(entries) => entries,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let dir = entry.path();
        if !dir.is_dir() {
            continue;
        }
        let places = dir.join("places.sqlite");
        if !places.exists() {
            continue;
        }
        let profile = entry.file_name().to_string_lossy().to_string();
        out.push(BrowserBookmarkSource {
            browser: "firefox".to_string(),
            profile: profile.clone(),
            label: format!("Firefox — {profile}"),
            path: places.to_string_lossy().to_string(),
        });
    }
}

/// Detect Safari (macOS only): `~/Library/Safari/Bookmarks.plist`.
fn push_safari_source(home: &Path, out: &mut Vec<BrowserBookmarkSource>) {
    if !cfg!(target_os = "macos") {
        return;
    }
    let plist = home.join("Library/Safari/Bookmarks.plist");
    if !plist.exists() {
        return;
    }
    out.push(BrowserBookmarkSource {
        browser: "safari".to_string(),
        profile: String::new(),
        label: "Safari".to_string(),
        path: plist.to_string_lossy().to_string(),
    });
}

#[tauri::command]
pub fn cmd_list_browser_bookmark_sources() -> Value {
    let mut sources: Vec<BrowserBookmarkSource> = Vec::new();
    if let Some(home) = dirs::home_dir() {
        push_chromium_sources(&home, &mut sources);
        push_firefox_sources(&home, &mut sources);
        push_safari_source(&home, &mut sources);
    }
    serde_json::json!({ "success": true, "sources": sources })
}
