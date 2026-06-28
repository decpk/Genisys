use serde_json::Value;
use std::fs;
use std::path::PathBuf;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

#[tauri::command]
pub async fn cmd_get_local_repo_items(root_path: String, path: String, show_hidden: Option<bool>) -> Value {
    let show = show_hidden.unwrap_or(false);
    let parent = path.trim_end_matches('/');
    let full = PathBuf::from(&root_path).join(parent.trim_start_matches('/'));
    match fs::read_dir(&full) {
        Ok(entries) => {
            let mut items: Vec<Value> = Vec::new();
            for entry in entries.filter_map(|e| e.ok()) {
                let name = entry.file_name().to_string_lossy().to_string();
                if !show && name.starts_with('.') { continue; }
                let meta = entry.metadata().ok();
                let is_dir = meta.as_ref().map(|m| m.is_dir()).unwrap_or(false);
                let size = if is_dir { None } else { meta.as_ref().map(|m| m.len()) };
                let modified = meta.as_ref().and_then(|m| m.modified().ok())
                    .map(|t| chrono::DateTime::<chrono::Utc>::from(t).to_rfc3339());
                #[cfg(unix)]
                let mode = meta.as_ref().map(|m| format!("{:o}", m.permissions().mode()));
                #[cfg(not(unix))]
                let mode: Option<String> = None;
                let item_path = if parent == "/" || parent.is_empty() {
                    format!("/{name}")
                } else {
                    format!("{parent}/{name}")
                };
                items.push(serde_json::json!({
                    "objectId": "", "gitObjectType": if is_dir {"tree"} else {"blob"},
                    "commitId": "", "path": item_path, "isFolder": is_dir,
                    "url": "", "size": size, "modifiedAt": modified, "mode": mode,
                }));
            }
            serde_json::json!({"success": true, "data": items})
        }
        Err(e) => crate::commands::err_val(match e.kind() {
            std::io::ErrorKind::NotFound => "Folder was deleted or moved.".to_string(),
            std::io::ErrorKind::PermissionDenied => "Permission denied.".to_string(),
            _ => e.to_string(),
        }),
    }
}
