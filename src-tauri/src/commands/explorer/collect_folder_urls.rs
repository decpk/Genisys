use serde_json::Value;
use std::fs;
use std::path::PathBuf;

use super::extract_urls::extract_urls;
use crate::file_walker::collect_repo_files;

/// Skip reading any single file larger than this (stay responsive).
const MAX_FILE_BYTES: u64 = 2 * 1024 * 1024;
/// Hard cap on the number of URLs returned.
const MAX_URLS: usize = 500;

/// Recursively scan every text file inside `folder_path` (relative to
/// `root_path`) and return the de-duplicated http(s)/www URLs found in their
/// contents. Honors `.gitignore` and skips binary / generated files via the
/// shared repo walker.
#[tauri::command]
pub async fn cmd_collect_folder_urls(root_path: String, folder_path: String) -> Value {
    let root = PathBuf::from(&root_path);
    let folder = if folder_path.is_empty() || folder_path == "/" {
        root.clone()
    } else {
        root.join(folder_path.trim_start_matches('/'))
    };

    let root_canon = match root.canonicalize() {
        Ok(p) => p,
        Err(e) => return crate::commands::err_val(format!("Cannot resolve root: {e}")),
    };
    let folder_canon = match folder.canonicalize() {
        Ok(p) => p,
        Err(e) => return crate::commands::err_val(format!("Cannot resolve folder: {e}")),
    };
    if !folder_canon.starts_with(&root_canon) {
        return crate::commands::err_val("Folder is outside the repository root");
    }
    if !folder_canon.is_dir() {
        return crate::commands::err_val("Path is not a directory");
    }

    let rel_files = collect_repo_files(&folder_canon);

    let mut urls: Vec<String> = Vec::new();
    'outer: for rel in rel_files {
        let file_path = folder_canon.join(&rel);
        if let Ok(meta) = fs::metadata(&file_path) {
            if meta.len() > MAX_FILE_BYTES {
                continue;
            }
        }
        let content = match fs::read_to_string(&file_path) {
            Ok(c) => c,
            Err(_) => continue, // binary / unreadable — skip
        };
        for url in extract_urls(&content) {
            if !urls.iter().any(|u| u == &url) {
                urls.push(url);
                if urls.len() >= MAX_URLS {
                    break 'outer;
                }
            }
        }
    }

    let count = urls.len();
    serde_json::json!({ "success": true, "urls": urls, "count": count })
}
