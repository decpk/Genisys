use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::path::Path;

/// `git clone <url> <target_path>` — clones into a fresh directory.
/// `target_path` is the **absolute** destination path (its parent
/// must exist, the target itself must not).
#[tauri::command]
pub async fn cmd_git_clone(
    url: String,
    target_path: String,
    branch: Option<String>,
    depth: Option<u32>,
) -> Value {
    if url.trim().is_empty() {
        return err_val("`url` is required.");
    }
    if target_path.trim().is_empty() {
        return err_val("`target_path` is required.");
    }
    let target = target_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let target_p = Path::new(&target);
        if target_p.exists() {
            return Err(format!("Target path already exists: {}", target));
        }
        if let Some(parent) = target_p.parent() {
            if !parent.exists() {
                return Err(format!("Parent directory does not exist: {}", parent.display()));
            }
        }
        let mut args: Vec<String> = vec!["clone".into()];
        if let Some(b) = branch.as_ref() {
            if !b.is_empty() {
                args.push("--branch".into());
                args.push(b.clone());
            }
        }
        if let Some(d) = depth {
            if d > 0 {
                args.push("--depth".into());
                args.push(d.to_string());
            }
        }
        args.push(url.clone());
        args.push(target.clone());
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let output = cmd_with_path("git")
            .args(&str_args)
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(json!({
            "stdout": String::from_utf8_lossy(&output.stdout).to_string(),
            "stderr": String::from_utf8_lossy(&output.stderr).to_string(),
            "targetPath": target,
        }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
