use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

#[tauri::command]
pub async fn cmd_git_fetch(root_path: String) -> Value {
    super::watcher::mark_self_write(&root_path);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = run_git_write(&root_path, &["fetch", "--all", "--prune"])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
