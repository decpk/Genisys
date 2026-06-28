use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git worktree add [-b <new_branch>] <path> [<branch>]` — adds a
/// new linked working tree at `path`. When `new_branch` is set, a
/// new branch is created from `branch` (or HEAD).
#[tauri::command]
pub async fn cmd_git_worktree_add(
    root_path: String,
    path: String,
    branch: Option<String>,
    new_branch: Option<String>,
) -> Value {
    if path.trim().is_empty() {
        return err_val("`path` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["worktree".into(), "add".into()];
        let nb_opt = new_branch.as_deref().filter(|s| !s.is_empty());
        if let Some(nb) = nb_opt {
            args.push("-b".into());
            args.push(nb.to_string());
        }
        args.push(path.clone());
        if let Some(b) = branch.as_ref() {
            if !b.is_empty() {
                args.push(b.clone());
            }
        }
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
