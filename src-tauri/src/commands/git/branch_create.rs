use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// Create a new branch. With `checkout=true`, runs `git checkout -b
/// <name> [start_point]` so HEAD moves; otherwise just creates the
/// ref via `git branch <name> [start_point]`.
#[tauri::command]
pub async fn cmd_git_branch_create(
    root_path: String,
    name: String,
    start_point: Option<String>,
    checkout: Option<bool>,
) -> Value {
    if name.trim().is_empty() {
        return err_val("Branch name is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = Vec::new();
        if checkout.unwrap_or(false) {
            args.push("checkout".into());
            args.push("-b".into());
        } else {
            args.push("branch".into());
        }
        args.push(name.clone());
        if let Some(sp) = start_point.as_ref() {
            if !sp.is_empty() {
                args.push(sp.clone());
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
