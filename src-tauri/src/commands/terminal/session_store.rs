// Per-tab terminal scrollback persistence.
//
// The standalone Terminal app restores its tab/split layout on relaunch by
// re-spawning a fresh shell per tab. These commands additionally persist each
// tab's on-screen output (an ANSI snapshot produced by xterm's SerializeAddon)
// to a file on disk so the previous scrollback can be replayed into the fresh
// shell. Files live under `<app_data_dir>/terminal-sessions/<key>.ans`, keyed by
// the tab's stable `persistentId`. A file is deleted when its tab is truly
// closed, and orphans are pruned after restore.
//
// Commands:
//   * cmd_terminal_session_save   — write a tab's scrollback snapshot
//   * cmd_terminal_session_load   — read a tab's scrollback snapshot (or null)
//   * cmd_terminal_session_delete — delete a tab's snapshot (on close)
//   * cmd_terminal_session_prune  — delete snapshots not in the keep-list (GC)

use serde_json::{json, Value};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Directory (under the app data dir) holding saved scrollback snapshots.
const SESSION_SUBDIR: &str = "terminal-sessions";
/// Extension for a saved scrollback snapshot (ANSI text from SerializeAddon).
const SESSION_EXT: &str = "ans";

/// Reject any key that could escape the `terminal-sessions/` directory. Keys are
/// frontend-generated UUIDs, so we allow only `[A-Za-z0-9_-]` and refuse path
/// separators, parent-dir tokens, and overly long values.
fn validate_session_key(key: &str) -> Result<(), String> {
    if key.is_empty() {
        return Err("session key is empty".to_string());
    }
    if key.len() > 128 {
        return Err("session key is too long".to_string());
    }
    if !key
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err("session key has invalid characters".to_string());
    }
    Ok(())
}

/// Resolve (and create) the `<app_data_dir>/terminal-sessions` directory.
fn session_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("failed to resolve app data dir: {e}"))?
        .join(SESSION_SUBDIR);
    std::fs::create_dir_all(&dir).map_err(|e| format!("create dir: {e}"))?;
    Ok(dir)
}

/// Resolve the absolute path of a session's saved scrollback file.
fn session_file(app: &AppHandle, key: &str) -> Result<PathBuf, String> {
    validate_session_key(key)?;
    Ok(session_dir(app)?.join(format!("{key}.{SESSION_EXT}")))
}

/// Persist a tab's scrollback snapshot to `<app_data>/terminal-sessions/<key>.ans`.
#[tauri::command]
pub fn cmd_terminal_session_save(app: AppHandle, key: String, data: String) -> Value {
    let path = match session_file(&app, &key) {
        Ok(p) => p,
        Err(e) => return json!({ "success": false, "error": e }),
    };
    match std::fs::write(&path, data.as_bytes()) {
        Ok(()) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "error": format!("write: {e}") }),
    }
}

/// Read a tab's saved scrollback snapshot. Returns `{ success, data }` where
/// `data` is the ANSI text, or `null` when no snapshot exists yet.
#[tauri::command]
pub fn cmd_terminal_session_load(app: AppHandle, key: String) -> Value {
    let path = match session_file(&app, &key) {
        Ok(p) => p,
        Err(e) => return json!({ "success": false, "error": e }),
    };
    if !path.exists() {
        return json!({ "success": true, "data": Value::Null });
    }
    match std::fs::read_to_string(&path) {
        Ok(data) => json!({ "success": true, "data": data }),
        Err(e) => json!({ "success": false, "error": format!("read: {e}") }),
    }
}

/// Delete a tab's saved scrollback snapshot (no-op when absent). Called when a
/// tab is truly closed so stale session data does not linger on disk.
#[tauri::command]
pub fn cmd_terminal_session_delete(app: AppHandle, key: String) -> Value {
    let path = match session_file(&app, &key) {
        Ok(p) => p,
        Err(e) => return json!({ "success": false, "error": e }),
    };
    match std::fs::remove_file(&path) {
        Ok(()) => json!({ "success": true }),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => json!({ "success": true }),
        Err(e) => json!({ "success": false, "error": format!("delete: {e}") }),
    }
}

/// Remove every saved scrollback file whose key is not in `keep` — used after
/// session restore to garbage-collect snapshots orphaned by a crash or by tabs
/// closed while the app was not running.
#[tauri::command]
pub fn cmd_terminal_session_prune(app: AppHandle, keep: Vec<String>) -> Value {
    let dir = match session_dir(&app) {
        Ok(d) => d,
        Err(e) => return json!({ "success": false, "error": e }),
    };
    let entries = match std::fs::read_dir(&dir) {
        Ok(e) => e,
        Err(e) => return json!({ "success": false, "error": format!("read dir: {e}") }),
    };
    let keep: std::collections::HashSet<&str> = keep.iter().map(String::as_str).collect();
    let mut removed = 0u32;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some(SESSION_EXT) {
            continue;
        }
        let stem = match path.file_stem().and_then(|s| s.to_str()) {
            Some(s) => s,
            None => continue,
        };
        if !keep.contains(stem) && std::fs::remove_file(&path).is_ok() {
            removed += 1;
        }
    }
    json!({ "success": true, "removed": removed })
}
