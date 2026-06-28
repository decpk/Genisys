use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_rename_item(root_path: String, old_path: String, new_path: String) -> Value {
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };

    let old_cleaned = old_path.trim_start_matches('/').trim_start_matches("./");
    let new_cleaned = new_path.trim_start_matches('/').trim_start_matches("./");

    if old_cleaned.is_empty() || new_cleaned.is_empty() {
        return crate::commands::err_val("Paths cannot be empty");
    }

    let old_full = root.join(old_cleaned);
    let new_full = root.join(new_cleaned);

    // Verify old path is within root
    let old_canon = match old_full.canonicalize() {
        Ok(c) => c,
        Err(e) => return crate::commands::err_val(format!("Source not found: {e}")),
    };
    if !old_canon.starts_with(&root) || old_canon == root {
        return crate::commands::err_val("Path traversal blocked on source");
    }

    // Verify new path's parent is within root
    if let Some(parent) = new_full.parent() {
        if parent.exists() {
            match parent.canonicalize() {
                Ok(canon_parent) if canon_parent.starts_with(&root) => {}
                _ => return crate::commands::err_val("Path traversal blocked on destination"),
            }
        } else {
            return crate::commands::err_val("Destination parent folder does not exist");
        }
    }

    if new_full.exists() {
        return crate::commands::err_val(format!("Destination already exists: {new_cleaned}"));
    }

    match fs::rename(&old_canon, &new_full) {
        Ok(_) => serde_json::json!({"success": true, "from": old_cleaned, "to": new_cleaned}),
        Err(e) => crate::commands::err_val(format!("Failed to rename: {e}")),
    }
}
