use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git restore [--source=<source>] [--staged] [--worktree] --
/// <paths...>`. At least one of `staged` / `worktree` must be true
/// (git defaults to `--worktree` when neither is passed; we mirror).
#[tauri::command]
pub async fn cmd_git_restore(
    root_path: String,
    paths: Vec<String>,
    source: Option<String>,
    staged: Option<bool>,
    worktree: Option<bool>,
) -> Value {
    if paths.is_empty() {
        return err_val("At least one path is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["restore".into()];
        if let Some(s) = source.as_ref() {
            if !s.is_empty() {
                args.push(format!("--source={}", s));
            }
        }
        let s_staged = staged.unwrap_or(false);
        let s_worktree = worktree.unwrap_or(!s_staged); // mirror git's default when neither given
        if s_staged {
            args.push("--staged".into());
        }
        if s_worktree {
            args.push("--worktree".into());
        }
        args.push("--".into());
        for p in &paths {
            args.push(p.clone());
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
