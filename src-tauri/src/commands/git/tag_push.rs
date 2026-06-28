use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// Push tag(s) to a remote.
/// - `all=true` → `git push <remote> --tags`
/// - `name` set → `git push <remote> <tagname>`
/// - default remote: `origin`.
#[tauri::command]
pub async fn cmd_git_tag_push(
    root_path: String,
    remote: Option<String>,
    name: Option<String>,
    all: Option<bool>,
) -> Value {
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let remote_name = remote
            .as_deref()
            .map(|s| if s.is_empty() { "origin" } else { s })
            .unwrap_or("origin")
            .to_string();
        let push_all = all.unwrap_or(false);
        let tag_name = name.unwrap_or_default();
        if !push_all && tag_name.is_empty() {
            return Err("Either `name` or `all=true` must be provided.".into());
        }
        let mut args: Vec<String> = vec!["push".into(), remote_name];
        if push_all {
            args.push("--tags".into());
        } else {
            args.push(tag_name);
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
