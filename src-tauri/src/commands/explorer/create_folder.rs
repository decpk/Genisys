use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_create_folder(root_path: String, folder_path: String) -> Value {
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };
    let cleaned = folder_path.trim_start_matches('/').trim_start_matches("./");
    if cleaned.is_empty() {
        return crate::commands::err_val("Folder path cannot be empty");
    }
    let full = root.join(cleaned);

    // Verify parent is within root
    if let Some(parent) = full.parent() {
        if parent.exists() {
            match parent.canonicalize() {
                Ok(canon_parent) if canon_parent.starts_with(&root) => {}
                _ => return crate::commands::err_val("Path traversal blocked"),
            }
        }
    }

    match fs::create_dir_all(&full) {
        Ok(_) => {
            // Verify the created path is within root
            match full.canonicalize() {
                Ok(canon) if canon.starts_with(&root) => {
                    serde_json::json!({"success": true, "path": cleaned})
                }
                _ => {
                    let _ = fs::remove_dir(&full);
                    crate::commands::err_val("Path traversal blocked")
                }
            }
        }
        Err(e) => crate::commands::err_val(format!("Failed to create folder: {e}")),
    }
}
