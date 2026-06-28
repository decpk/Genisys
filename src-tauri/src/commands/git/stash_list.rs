use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// Lists stash entries using a stable, parser-friendly format:
/// `<ref>|<iso8601 date>|<subject>` per line.
#[tauri::command]
pub async fn cmd_git_stash_list(root_path: String) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let out = run_git_read(&rp, &["stash", "list", "--pretty=format:%gd|%ci|%gs"])?;
        Ok(json!({ "stdout": out }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
