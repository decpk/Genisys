// Directory listing for in-terminal path autocomplete.
//
// The standalone Terminal app offers filesystem completion in its autocomplete
// dropdown: when the user is typing a path-like argument, it lists the real
// files/folders in the relevant directory. This command resolves a directory
// (relative to the tab's cwd, or `~`/absolute) and returns its immediate
// entries as `{ name, isDir }`.
//
// SECURITY: this is read-only directory metadata (names + is-dir flags, never
// file contents) and runs with the same privileges as the shell already
// running in the tab — strictly less powerful than the PTY itself. Inputs are
// length-capped and a non-existent/unreadable directory yields an empty list
// rather than an error.
//
// Command:
//   * cmd_terminal_list_dir — list a directory's immediate entries

use serde_json::{json, Value};
use std::path::PathBuf;

/// Cap on directory entries scanned (the frontend filters + trims further).
const MAX_ENTRIES: usize = 1000;
/// Reject absurdly long path inputs.
const MAX_PATH_LEN: usize = 4096;

/// Resolve the user's home directory from the environment.
fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("USERPROFILE").map(PathBuf::from))
}

/// Resolve the directory to list: absolute (`/…`), home-relative (`~/…`), or
/// relative to the tab's `cwd`. An empty `dir` lists `cwd` itself.
fn resolve_dir(cwd: &str, dir: &str) -> Option<PathBuf> {
    if dir.starts_with('/') {
        Some(PathBuf::from(dir))
    } else if dir == "~" {
        home_dir()
    } else if let Some(rest) = dir.strip_prefix("~/") {
        Some(home_dir()?.join(rest))
    } else {
        Some(PathBuf::from(cwd).join(dir))
    }
}

/// List the immediate entries of a directory for path autocomplete.
///
/// Returns `{ success: true, data: [{ name, isDir }] }` with directories first
/// then case-insensitive name order. A missing/unreadable directory returns an
/// empty list (not an error) so typing an as-yet-incomplete path is harmless.
#[tauri::command]
pub async fn cmd_terminal_list_dir(cwd: String, dir: String) -> Value {
    if cwd.len() > MAX_PATH_LEN || dir.len() > MAX_PATH_LEN {
        return json!({ "success": false, "error": "path too long" });
    }
    let base = match resolve_dir(&cwd, &dir) {
        Some(b) => b,
        None => return json!({ "success": true, "data": [] }),
    };
    let read = match std::fs::read_dir(&base) {
        Ok(r) => r,
        Err(_) => return json!({ "success": true, "data": [] }),
    };
    let mut entries: Vec<(String, bool)> = Vec::new();
    for entry in read.flatten() {
        if entries.len() >= MAX_ENTRIES {
            break;
        }
        let name = match entry.file_name().into_string() {
            Ok(n) => n,
            Err(_) => continue,
        };
        // `path().is_dir()` follows symlinks so symlinked dirs complete with `/`.
        let is_dir = entry.path().is_dir();
        entries.push((name, is_dir));
    }
    entries.sort_by(|a, b| {
        b.1.cmp(&a.1)
            .then_with(|| a.0.to_lowercase().cmp(&b.0.to_lowercase()))
    });
    let data: Vec<Value> = entries
        .into_iter()
        .map(|(name, is_dir)| json!({ "name": name, "isDir": is_dir }))
        .collect();
    json!({ "success": true, "data": data })
}
