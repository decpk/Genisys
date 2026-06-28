use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

#[tauri::command]
pub async fn cmd_git_checkout_branch(
    root_path: String,
    branch: String,
    create: bool,
) -> Value {
    super::watcher::mark_self_write(&root_path);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = if create {
            run_git_write(&root_path, &["checkout", "-b", &branch])?
        } else {
            run_git_write(&root_path, &["checkout", &branch])?
        };
        Ok(json!({ "stdout": stdout, "branch": branch }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
