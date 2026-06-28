use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// Commit using `git commit -F -` and pipe message via stdin so we
/// never need shell-escape magic on multi-line messages.
#[tauri::command]
pub async fn cmd_git_commit(root_path: String, message: String) -> Value {
    super::watcher::mark_self_write(&root_path);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut child = cmd_with_path("git")
            .args(["commit", "-F", "-"])
            .current_dir(&root_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        if let Some(stdin) = child.stdin.as_mut() {
            stdin.write_all(message.as_bytes()).map_err(|e| e.to_string())?;
        }
        let output = child.wait_with_output().map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(json!({ "stdout": String::from_utf8_lossy(&output.stdout).to_string() }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
