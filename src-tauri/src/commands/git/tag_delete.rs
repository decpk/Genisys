use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// Delete one or more local tags via `git tag -d <names...>`.
#[tauri::command]
pub async fn cmd_git_tag_delete(root_path: String, names: Vec<String>) -> Value {
    if names.is_empty() {
        return err_val("`names` must not be empty.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["tag".into(), "-d".into()];
        for n in &names {
            if !n.is_empty() {
                args.push(n.clone());
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
