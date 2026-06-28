use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// Save current changes to the stash. Maps to
/// `git stash push [-m <message>] [--include-untracked] [--keep-index]`.
#[tauri::command]
pub async fn cmd_git_stash_save(
    root_path: String,
    message: Option<String>,
    include_untracked: Option<bool>,
    keep_index: Option<bool>,
) -> Value {
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["stash".into(), "push".into()];
        if include_untracked.unwrap_or(false) {
            args.push("--include-untracked".into());
        }
        if keep_index.unwrap_or(false) {
            args.push("--keep-index".into());
        }
        if let Some(m) = message.as_ref() {
            if !m.is_empty() {
                args.push("-m".into());
                args.push(m.clone());
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
