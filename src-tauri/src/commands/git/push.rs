use crate::commands::{err_val, run_git, run_git_write};
use serde_json::{json, Value};

#[tauri::command]
pub async fn cmd_git_push(root_path: String, set_upstream: bool) -> Value {
    super::watcher::mark_self_write(&root_path);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        if set_upstream {
            let branch = run_git(&root_path, &["branch", "--show-current"])?
                .trim()
                .to_string();
            if branch.is_empty() {
                return Err("Detached HEAD — cannot publish branch.".into());
            }
            let stdout = run_git_write(
                &root_path,
                &["push", "--set-upstream", "origin", &branch],
            )?;
            Ok(json!({ "stdout": stdout, "branch": branch }))
        } else {
            let stdout = run_git_write(&root_path, &["push"])?;
            Ok(json!({ "stdout": stdout }))
        }
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
