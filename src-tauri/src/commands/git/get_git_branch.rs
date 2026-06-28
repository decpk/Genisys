use crate::commands::{err_val, run_git};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_git_branch(root_path: String) -> Value {
    match tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let branch = run_git(&root_path, &["branch", "--show-current"])?
            .trim()
            .to_string();
        if !branch.is_empty() {
            return Ok(serde_json::json!({ "branch": branch, "detached": false }));
        }
        // Detached HEAD — fall back to short SHA
        let sha = run_git(&root_path, &["rev-parse", "--short", "HEAD"])?
            .trim()
            .to_string();
        Ok(serde_json::json!({ "branch": sha, "detached": true }))
    })
    .await
    {
        Ok(Ok(data)) => serde_json::json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
