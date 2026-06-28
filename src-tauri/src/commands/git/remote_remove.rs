use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git remote remove <name>` — drops the remote (does NOT touch
/// remote tracking refs on disk, but they become orphaned).
#[tauri::command]
pub async fn cmd_git_remote_remove(root_path: String, name: String) -> Value {
    if name.trim().is_empty() {
        return err_val("`name` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = run_git_write(&rp, &["remote", "remove", &name])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
