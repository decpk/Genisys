use crate::commands::{err_val, run_git};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_git_commit_count(root_path: String) -> Value {
    match tokio::task::spawn_blocking(move || {
        // Match the filter used by cmd_get_git_log (--no-merges) so the count
        // aligns with the rendered list.
        run_git(&root_path, &["rev-list", "--count", "--no-merges", "HEAD"])
    })
    .await
    {
        Ok(Ok(out)) => {
            let count: i64 = out.trim().parse().unwrap_or(0);
            serde_json::json!({"success": true, "data": count})
        }
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
