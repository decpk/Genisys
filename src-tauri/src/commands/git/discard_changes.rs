use crate::commands::{err_val, run_git, run_git_write};
use serde_json::{json, Value};

#[tauri::command]
pub async fn cmd_git_discard_changes(root_path: String, files: Vec<String>) -> Value {
    super::watcher::mark_self_write(&root_path);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut tracked: Vec<String> = Vec::new();
        let mut untracked: Vec<String> = Vec::new();
        for f in &files {
            // `--error-unmatch` errors when the path is not in the index
            // (i.e. untracked), so success → tracked, failure → untracked.
            if run_git(&root_path, &["ls-files", "--error-unmatch", "--", f]).is_ok() {
                tracked.push(f.clone());
            } else {
                untracked.push(f.clone());
            }
        }
        if !tracked.is_empty() {
            let mut args: Vec<&str> = vec!["checkout", "--"];
            for f in &tracked { args.push(f); }
            run_git_write(&root_path, &args)?;
        }
        if !untracked.is_empty() {
            let mut args: Vec<&str> = vec!["clean", "-f", "--"];
            for f in &untracked { args.push(f); }
            run_git_write(&root_path, &args)?;
        }
        Ok(json!({ "ok": true, "tracked": tracked.len(), "untracked": untracked.len() }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
