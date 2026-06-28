use crate::commands::git::watcher::mark_self_write;
use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// `git commit --amend`. When `message` is supplied, it is piped via
/// stdin (`-F -`) to avoid shell-escape issues. `no_edit=true` keeps
/// the existing message. Mirrors `cmd_git_commit`'s safe stdin path.
#[tauri::command]
pub async fn cmd_git_commit_amend(
    root_path: String,
    message: Option<String>,
    no_edit: Option<bool>,
) -> Value {
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let has_message = message.as_deref().map(|s| !s.is_empty()).unwrap_or(false);
        let mut args: Vec<&str> = vec!["commit", "--amend"];
        if no_edit.unwrap_or(false) && !has_message {
            args.push("--no-edit");
        }
        if has_message {
            args.push("-F");
            args.push("-");
        }
        let mut child = cmd_with_path("git")
            .args(&args)
            .current_dir(&rp)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        if has_message {
            if let Some(stdin) = child.stdin.as_mut() {
                stdin
                    .write_all(message.as_deref().unwrap_or("").as_bytes())
                    .map_err(|e| e.to_string())?;
            }
        }
        let output = child.wait_with_output().map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(json!({
            "stdout": String::from_utf8_lossy(&output.stdout).to_string()
        }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
