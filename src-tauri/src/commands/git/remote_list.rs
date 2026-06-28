use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git remote -v` — list all remotes and their fetch/push URLs.
#[tauri::command]
pub async fn cmd_git_remote_list(root_path: String) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = run_git_read(&rp, &["remote", "-v"])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
