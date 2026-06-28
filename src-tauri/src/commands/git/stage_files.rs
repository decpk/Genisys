use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

#[tauri::command]
pub async fn cmd_git_stage_files(root_path: String, files: Vec<String>) -> Value {
    super::watcher::mark_self_write(&root_path);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        if files.is_empty() {
            run_git_write(&root_path, &["add", "-A"])?;
        } else {
            let mut args: Vec<&str> = vec!["add", "--"];
            for f in &files { args.push(f); }
            run_git_write(&root_path, &args)?;
        }
        Ok(json!({ "ok": true }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
