use serde_json::Value;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_list_repo_files(
    root_path: String,
    max_results: Option<usize>,
) -> Value {
    let max = max_results.unwrap_or(500);
    let root = PathBuf::from(&root_path);

    if !root.is_dir() {
        return crate::commands::err_val("Root path is not a directory");
    }

    let mut files = crate::file_walker::collect_repo_files(&root);
    files.truncate(max);

    serde_json::json!({
        "success": true,
        "data": files,
        "totalFiles": files.len(),
    })
}
