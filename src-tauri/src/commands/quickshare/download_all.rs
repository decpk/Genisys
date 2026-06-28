//! `cmd_quickshare_download_all` — gather every shared file into the desktop's
//! QuickShare download folder. Files already saved there (received uploads) are
//! left untouched; files shared in place from elsewhere are copied in with a
//! non-colliding name. Text snippets are ignored.

use std::path::Path;

use serde_json::{json, Value};
use tauri::State;

use super::state::QuickShareManager;
use super::util::{sanitize_filename, unique_path};

#[tauri::command]
pub async fn cmd_quickshare_download_all(
    manager: State<'_, QuickShareManager>,
) -> Result<Value, String> {
    let storage_dir = match manager.storage_dir() {
        Some(d) => d,
        None => return Ok(json!({ "success": false, "error": "QuickShare is not running" })),
    };
    let dir = Path::new(&storage_dir);
    let items = manager.snapshot_items();

    let mut copied = 0u32;
    let mut already_saved = 0u32;
    for item in items {
        if item.kind != "file" {
            continue;
        }
        let src = match item.local_path {
            Some(p) => p,
            None => continue,
        };
        let src_path = Path::new(&src);
        // Already inside the QuickShare folder (a received upload) — nothing to do.
        if src_path.parent() == Some(dir) {
            already_saved += 1;
            continue;
        }
        if !src_path.exists() {
            continue;
        }
        let name = sanitize_filename(&item.name);
        let dest = unique_path(dir, &name);
        match std::fs::copy(src_path, &dest) {
            Ok(_) => copied += 1,
            Err(e) => eprintln!("[quickshare] download_all copy failed: {e}"),
        }
    }

    Ok(json!({
        "success": true,
        "data": { "copied": copied, "alreadySaved": already_saved, "dir": storage_dir }
    }))
}
