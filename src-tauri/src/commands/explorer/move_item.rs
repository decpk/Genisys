use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_move_item(
    root_path: String,
    source: String,
    destination: String,
    source_root: Option<String>,
) -> Value {
    // Destination root (where the item is moved into).
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };

    // Source root may differ from the destination root (cross-root move).
    // Defaults to the destination root when not provided.
    let src_root = match source_root.as_deref() {
        Some(sr) => match PathBuf::from(sr).canonicalize() {
            Ok(r) => r,
            Err(e) => return crate::commands::err_val(format!("Invalid source root path: {e}")),
        },
        None => root.clone(),
    };

    let src_cleaned = source.trim_start_matches('/').trim_start_matches("./");
    let dst_cleaned = destination.trim_start_matches('/').trim_start_matches("./");

    if src_cleaned.is_empty() || dst_cleaned.is_empty() {
        return crate::commands::err_val("Paths cannot be empty");
    }

    let src_full = src_root.join(src_cleaned);
    let dst_full = root.join(dst_cleaned);

    // Verify source is within its own root
    let src_canon = match src_full.canonicalize() {
        Ok(c) => c,
        Err(e) => return crate::commands::err_val(format!("Source not found: {e}")),
    };
    if !src_canon.starts_with(&src_root) || src_canon == src_root {
        return crate::commands::err_val("Path traversal blocked on source");
    }

    // Verify destination parent is within the destination root
    if let Some(parent) = dst_full.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return crate::commands::err_val(format!("Failed to create destination directory: {e}"));
            }
        }
        match parent.canonicalize() {
            Ok(canon_parent) if canon_parent.starts_with(&root) => {}
            _ => return crate::commands::err_val("Path traversal blocked on destination"),
        }
    }

    if dst_full.exists() {
        return crate::commands::err_val(format!("Destination already exists: {dst_cleaned}"));
    }

    match fs::rename(&src_canon, &dst_full) {
        Ok(_) => serde_json::json!({"success": true, "from": src_cleaned, "to": dst_cleaned}),
        Err(e) => crate::commands::err_val(format!("Failed to move: {e}")),
    }
}
