use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git worktree remove [-f] <path>` — detaches and removes the
/// linked worktree. `force=true` removes even with dirty changes.
#[tauri::command]
pub async fn cmd_git_worktree_remove(
    root_path: String,
    path: String,
    force: Option<bool>,
) -> Value {
    if path.trim().is_empty() {
        return err_val("`path` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["worktree".into(), "remove".into()];
        if force.unwrap_or(false) {
            args.push("-f".into());
        }
        args.push(path.clone());
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let stdout = run_git_write(&rp, &str_args)?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
