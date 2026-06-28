use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git submodule add <repo> <path>` — registers a submodule and
/// fetches its initial commit.
#[tauri::command]
pub async fn cmd_git_submodule_add(root_path: String, repo: String, path: String) -> Value {
    if repo.trim().is_empty() {
        return err_val("`repo` is required.");
    }
    if path.trim().is_empty() {
        return err_val("`path` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = run_git_write(&rp, &["submodule", "add", &repo, &path])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
