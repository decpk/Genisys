use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git remote set-url [--push] <name> <url>`.
#[tauri::command]
pub async fn cmd_git_remote_set_url(
    root_path: String,
    name: String,
    url: String,
    push: Option<bool>,
) -> Value {
    if name.trim().is_empty() {
        return err_val("`name` is required.");
    }
    if url.trim().is_empty() {
        return err_val("`url` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["remote".into(), "set-url".into()];
        if push.unwrap_or(false) {
            args.push("--push".into());
        }
        args.push(name.clone());
        args.push(url.clone());
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
