use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_read, run_git_write};
use serde_json::{json, Value};

/// Delete a branch. `force=false` → `git branch -d` (refuses
/// unmerged); `force=true` → `git branch -D`. Refuses to delete the
/// currently checked-out branch.
#[tauri::command]
pub async fn cmd_git_branch_delete(
    root_path: String,
    name: String,
    force: Option<bool>,
) -> Value {
    if name.trim().is_empty() {
        return err_val("Branch name is required.");
    }
    let rp = root_path.clone();
    let name_clone = name.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        // Refuse to delete current branch.
        if let Ok(out) = run_git_read(&rp, &["rev-parse", "--abbrev-ref", "HEAD"]) {
            if out.trim() == name_clone {
                return Err(format!(
                    "Cannot delete '{}' — it is the currently checked-out branch.",
                    name_clone
                ));
            }
        }
        let flag = if force.unwrap_or(false) { "-D" } else { "-d" };
        let stdout = run_git_write(&rp, &["branch", flag, &name_clone])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
