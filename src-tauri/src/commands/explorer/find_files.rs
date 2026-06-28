use serde_json::Value;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_find_files(
    root_path: String,
    pattern: String,
    max_results: Option<usize>,
) -> Value {
    let max = max_results.unwrap_or(200);
    let root = PathBuf::from(&root_path);

    if !root.is_dir() {
        return crate::commands::err_val("Root path is not a directory");
    }

    let glob = match glob::Pattern::new(&pattern) {
        Ok(g) => g,
        Err(e) => return crate::commands::err_val(format!("Invalid glob pattern: {e}")),
    };

    let mut files = crate::file_walker::collect_repo_files(&root);

    // Filter by glob pattern
    files.retain(|f| {
        let name = f.rsplit('/').next().unwrap_or(f);
        glob.matches(f) || glob.matches(name)
    });

    files.truncate(max);

    serde_json::json!({
        "success": true,
        "data": files,
        "totalMatches": files.len(),
    })
}
