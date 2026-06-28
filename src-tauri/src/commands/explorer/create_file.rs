use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_create_file(root_path: String, file_path: String, content: String) -> Value {
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };
    let cleaned = file_path.trim_start_matches('/').trim_start_matches("./");
    let full = root.join(cleaned);

    // Canonicalize the parent to verify it's within root
    if let Some(parent) = full.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return crate::commands::err_val(format!("Failed to create parent directories: {e}"));
            }
        }
        match parent.canonicalize() {
            Ok(canon_parent) if canon_parent.starts_with(&root) => {}
            _ => return crate::commands::err_val("Path traversal blocked"),
        }
    }

    if full.exists() {
        return crate::commands::err_val(format!("File already exists: {cleaned}"));
    }

    match fs::write(&full, &content) {
        Ok(_) => serde_json::json!({"success": true, "path": cleaned}),
        Err(e) => crate::commands::err_val(format!("Failed to create file: {e}")),
    }
}
