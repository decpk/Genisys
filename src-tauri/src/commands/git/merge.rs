use crate::commands::cmd_with_path;
use crate::commands::err_val;
use crate::commands::git::run_git_or_conflict::run_git_or_conflict;
use crate::commands::git::watcher::mark_self_write;
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// `git merge [--no-ff|--squash] <ref> [-m "..."]`. When `message`
/// is supplied, piped via stdin (`-F -`) to avoid shell escaping.
/// On conflict, returns `{ status: "conflict", stderr }` so the
/// AI can inspect via `git_status` and continue with
/// `git_merge_continue` / `git_merge_abort`.
#[tauri::command]
pub async fn cmd_git_merge(
    root_path: String,
    ref_name: String,
    no_ff: Option<bool>,
    squash: Option<bool>,
    message: Option<String>,
) -> Value {
    if ref_name.trim().is_empty() {
        return err_val("`refName` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let has_message = message.as_deref().map(|s| !s.is_empty()).unwrap_or(false);
        if has_message {
            // Use stdin pipe for message safety.
            let mut args: Vec<String> = vec!["merge".into()];
            if no_ff.unwrap_or(false) {
                args.push("--no-ff".into());
            }
            if squash.unwrap_or(false) {
                args.push("--squash".into());
            }
            args.push("-F".into());
            args.push("-".into());
            args.push(ref_name.clone());
            let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
            let mut child = cmd_with_path("git")
                .env("GIT_EDITOR", "true")
                .args(&str_args)
                .current_dir(&rp)
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .map_err(|e| e.to_string())?;
            if let Some(stdin) = child.stdin.as_mut() {
                stdin
                    .write_all(message.as_deref().unwrap_or("").as_bytes())
                    .map_err(|e| e.to_string())?;
            }
            let output = child.wait_with_output().map_err(|e| e.to_string())?;
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            if output.status.success() {
                return Ok(json!({ "status": "ok", "stdout": stdout, "stderr": stderr }));
            }
            let lower = stderr.to_lowercase();
            let is_conflict = lower.contains("conflict")
                || lower.contains("automatic merge failed");
            if is_conflict {
                return Ok(json!({ "status": "conflict", "stdout": stdout, "stderr": stderr }));
            }
            return Err(stderr);
        }
        // No message: rely on git's default merge-commit message.
        let mut args: Vec<String> = vec!["merge".into(), "--no-edit".into()];
        if no_ff.unwrap_or(false) {
            args.push("--no-ff".into());
        }
        if squash.unwrap_or(false) {
            args.push("--squash".into());
        }
        args.push(ref_name.clone());
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        run_git_or_conflict(&rp, &str_args)
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
