use crate::commands::git::watcher::mark_self_write;
use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// `git am` — apply a mailbox-formatted patch series. The patch
/// text is piped on stdin to avoid temp files. `three_way=true`
/// enables `--3way` for partial-context application.
///
/// Sets `GIT_EDITOR=true` so any in-flight commit-message editor
/// can't hang the call.
#[tauri::command]
pub async fn cmd_git_am(
    root_path: String,
    patch_text: String,
    three_way: Option<bool>,
) -> Value {
    if patch_text.is_empty() {
        return err_val("`patch_text` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<&str> = vec!["am"];
        if three_way.unwrap_or(false) {
            args.push("--3way");
        }
        let mut child = cmd_with_path("git")
            .args(&args)
            .current_dir(&rp)
            .env("GIT_EDITOR", "true")
            .env("GIT_SEQUENCE_EDITOR", "true")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        if let Some(stdin) = child.stdin.as_mut() {
            stdin
                .write_all(patch_text.as_bytes())
                .map_err(|e| e.to_string())?;
        }
        let output = child.wait_with_output().map_err(|e| e.to_string())?;
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let combined = format!("{}{}", stdout, stderr).to_lowercase();
        let status = if output.status.success() {
            "ok"
        } else if combined.contains("patch failed")
            || combined.contains("applying:")
            || combined.contains("could not apply")
            || combined.contains("conflict")
        {
            "conflict"
        } else {
            return Err(if stderr.trim().is_empty() { "git am failed.".into() } else { stderr });
        };
        Ok(json!({ "status": status, "stdout": stdout, "stderr": stderr }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
