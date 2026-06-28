use crate::commands::git::watcher::mark_self_write;
use crate::commands::{cmd_with_path, err_val, run_git_write};
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// Create a git tag. With `annotated=true` and a `message`, creates
/// an annotated tag (`-a -m <msg>`); message is passed via stdin
/// (`-F -`) to avoid shell escaping. Without `annotated`, creates a
/// lightweight tag. Optional `ref_name` selects the commit to tag
/// (defaults to HEAD).
#[tauri::command]
pub async fn cmd_git_tag_create(
    root_path: String,
    name: String,
    ref_name: Option<String>,
    message: Option<String>,
    annotated: Option<bool>,
) -> Value {
    if name.trim().is_empty() {
        return err_val("`name` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let want_annotated = annotated.unwrap_or(false) || message.is_some();
        let has_message = message.as_deref().map(|s| !s.is_empty()).unwrap_or(false);
        if want_annotated && has_message {
            let mut args: Vec<String> = vec!["tag".into(), "-a".into(), "-F".into(), "-".into()];
            args.push(name.clone());
            if let Some(r) = ref_name.as_ref() {
                if !r.is_empty() {
                    args.push(r.clone());
                }
            }
            let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
            let mut child = cmd_with_path("git")
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
            if !output.status.success() {
                return Err(String::from_utf8_lossy(&output.stderr).to_string());
            }
            return Ok(json!({ "stdout": String::from_utf8_lossy(&output.stdout).to_string() }));
        }
        // Lightweight tag (or annotated without message — fall back to lightweight).
        let mut args: Vec<String> = vec!["tag".into(), name.clone()];
        if let Some(r) = ref_name.as_ref() {
            if !r.is_empty() {
                args.push(r.clone());
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
