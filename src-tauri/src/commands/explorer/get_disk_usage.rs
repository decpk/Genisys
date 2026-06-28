use serde_json::Value;
use std::fs;
use std::path::PathBuf;

fn dir_size(path: &PathBuf) -> (u64, u64, u64) {
    // Returns (total_bytes, file_count, folder_count)
    let mut bytes: u64 = 0;
    let mut files: u64 = 0;
    let mut folders: u64 = 0;

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let p = entry.path();
            if p.is_dir() {
                folders += 1;
                let (b, f, d) = dir_size(&p);
                bytes += b;
                files += f;
                folders += d;
            } else {
                files += 1;
                if let Ok(meta) = p.metadata() {
                    bytes += meta.len();
                }
            }
        }
    }
    (bytes, files, folders)
}

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{bytes} B")
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else if bytes < 1024 * 1024 * 1024 {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    } else {
        format!("{:.2} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0))
    }
}

#[tauri::command]
pub async fn cmd_get_disk_usage(root_path: String, path: String) -> Value {
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };

    let cleaned = path.trim_start_matches('/').trim_start_matches("./");
    let full = if cleaned.is_empty() {
        root.clone()
    } else {
        root.join(cleaned)
    };

    let canon = match full.canonicalize() {
        Ok(c) => c,
        Err(e) => return crate::commands::err_val(format!("Path not found: {e}")),
    };

    if !canon.starts_with(&root) {
        return crate::commands::err_val("Path traversal blocked");
    }

    if canon.is_dir() {
        let (bytes, files, folders) = dir_size(&canon);
        serde_json::json!({
            "success": true,
            "path": cleaned,
            "isFolder": true,
            "totalBytes": bytes,
            "formattedSize": format_size(bytes),
            "fileCount": files,
            "folderCount": folders,
        })
    } else {
        let bytes = fs::metadata(&canon).map(|m| m.len()).unwrap_or(0);
        serde_json::json!({
            "success": true,
            "path": cleaned,
            "isFolder": false,
            "totalBytes": bytes,
            "formattedSize": format_size(bytes),
            "fileCount": 1,
            "folderCount": 0,
        })
    }
}
