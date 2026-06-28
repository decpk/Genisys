use crate::commands::git::watcher::mark_self_write;
use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// `git apply` with the patch text supplied via stdin. Set
/// `check=true` for a dry-run validation pass (`--check`).
/// `three_way=true` enables `--3way` so partial application succeeds
/// when context lines differ.
#[tauri::command]
pub async fn cmd_git_apply_patch(
    root_path: String,
    patch_text: String,
    check: Option<bool>,
    three_way: Option<bool>,
) -> Value {
    if patch_text.is_empty() {
        return err_val("`patch_text` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<&str> = vec!["apply"];
        if check.unwrap_or(false) {
            args.push("--check");
        }
        if three_way.unwrap_or(false) {
            args.push("--3way");
        }
        let mut child = cmd_with_path("git")
            .args(&args)
            .current_dir(&rp)
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
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            return Err(if stderr.trim().is_empty() {
                "git apply failed.".into()
            } else {
                stderr
            });
        }
        Ok(json!({
            "stdout": String::from_utf8_lossy(&output.stdout).to_string(),
            "stderr": String::from_utf8_lossy(&output.stderr).to_string(),
        }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
