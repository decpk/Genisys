use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git stash apply [stash_ref]` — applies the stash without dropping
/// it from the stash list.
#[tauri::command]
pub async fn cmd_git_stash_apply(root_path: String, stash_ref: Option<String>) -> Value {
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["stash".into(), "apply".into()];
        if let Some(s) = stash_ref.as_ref() {
            if !s.is_empty() {
                args.push(s.clone());
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
