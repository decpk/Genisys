use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git reset --<mode> <target>`. `mode` is one of `soft | mixed |
/// hard`. `hard` is destructive (overwrites working tree).
#[tauri::command]
pub async fn cmd_git_reset(root_path: String, target: String, mode: String) -> Value {
    if target.trim().is_empty() {
        return err_val("`target` is required.");
    }
    let mode_flag = match mode.as_str() {
        "soft" => "--soft",
        "mixed" => "--mixed",
        "hard" => "--hard",
        other => return err_val(format!("Invalid reset mode '{other}'. Use soft | mixed | hard.")),
    };
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = run_git_write(&rp, &["reset", mode_flag, &target])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
