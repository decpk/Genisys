use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_delete_item(root_path: String, path: String) -> Value {
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };
    let cleaned = path.trim_start_matches('/').trim_start_matches("./");
    if cleaned.is_empty() {
        return crate::commands::err_val("Cannot delete root path itself");
    }

    let full = root.join(cleaned);
    let canon = match full.canonicalize() {
        Ok(c) => c,
        Err(e) => return crate::commands::err_val(format!("Path not found: {e}")),
    };

    // Must be strictly inside root (not root itself)
    if !canon.starts_with(&root) || canon == root {
        return crate::commands::err_val("Path traversal blocked — cannot delete outside root or root itself");
    }

    if canon.is_dir() {
        match fs::remove_dir_all(&canon) {
            Ok(_) => serde_json::json!({"success": true, "deleted": cleaned, "wasFolder": true}),
            Err(e) => crate::commands::err_val(format!("Failed to delete folder: {e}")),
        }
    } else {
        match fs::remove_file(&canon) {
            Ok(_) => serde_json::json!({"success": true, "deleted": cleaned, "wasFolder": false}),
            Err(e) => crate::commands::err_val(format!("Failed to delete file: {e}")),
        }
    }
}
