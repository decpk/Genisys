use crate::commands::run_git;
use serde_json::Value;

#[tauri::command]
pub async fn cmd_is_local_git_repo(root_path: String) -> Value {
    match tokio::task::spawn_blocking(move || run_git(&root_path, &["rev-parse","--is-inside-work-tree"])).await {
        Ok(Ok(out)) => serde_json::json!({"success": true, "data": out.trim() == "true"}),
        _ => serde_json::json!({"success": true, "data": false}),
    }
}
