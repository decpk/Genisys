use std::fs;
use std::path::PathBuf;

use serde_json::{json, Value};

use super::utils::ensure_abs;
use crate::commands::fs_watcher::mark_self_write_for_path;

#[tauri::command]
pub async fn cmd_code_write_file(path: String, content: String) -> Value {
    let abs = PathBuf::from(&path);
    if let Err(e) = ensure_abs(&abs) {
        return json!({ "success": false, "error": e });
    }
    if let Some(parent) = abs.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            return json!({ "success": false, "error": format!("Create parent: {e}") });
        }
    }
    // Atomic write: write to temp file, then rename onto target.
    let tmp = abs.with_extension(format!(
        "{}.genisys-tmp",
        abs.extension().and_then(|s| s.to_str()).unwrap_or("")
    ));
    if let Err(e) = fs::write(&tmp, content.as_bytes()) {
        return json!({ "success": false, "error": format!("Write temp: {e}") });
    }
    if let Err(e) = fs::rename(&tmp, &abs) {
        let _ = fs::remove_file(&tmp);
        return json!({ "success": false, "error": format!("Rename: {e}") });
    }
    mark_self_write_for_path(&abs);
    let size = fs::metadata(&abs).map(|m| m.len()).unwrap_or(0);
    json!({ "success": true, "data": { "size": size } })
}
