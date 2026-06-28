use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// Rename a branch. `from` defaults to the current branch when
/// omitted. `force=true` overrides an existing destination ref.
#[tauri::command]
pub async fn cmd_git_branch_rename(
    root_path: String,
    from: Option<String>,
    to: String,
    force: Option<bool>,
) -> Value {
    if to.trim().is_empty() {
        return err_val("Destination branch name (`to`) is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let flag = if force.unwrap_or(false) { "-M" } else { "-m" };
        let mut args: Vec<String> = vec!["branch".into(), flag.into()];
        if let Some(f) = from.as_ref() {
            if !f.is_empty() {
                args.push(f.clone());
            }
        }
        args.push(to.clone());
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
