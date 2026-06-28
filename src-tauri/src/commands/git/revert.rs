use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git revert [--no-commit] <commit>`. Single-commit revert only.
/// May leave the tree in a conflicted state; callers should check
/// `git_operation_state` afterwards.
#[tauri::command]
pub async fn cmd_git_revert(
    root_path: String,
    commit: String,
    no_commit: Option<bool>,
) -> Value {
    if commit.trim().is_empty() {
        return err_val("`commit` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["revert".into()];
        if no_commit.unwrap_or(false) {
            args.push("--no-commit".into());
        }
        args.push(commit.clone());
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
