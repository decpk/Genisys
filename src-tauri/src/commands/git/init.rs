use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::fs;
use std::path::Path;

/// `git init [--bare] [--initial-branch=<name>] <target_path>` —
/// initializes a new repo at `target_path`. The target must not
/// already contain a `.git` directory.
#[tauri::command]
pub async fn cmd_git_init(
    target_path: String,
    bare: Option<bool>,
    initial_branch: Option<String>,
) -> Value {
    if target_path.trim().is_empty() {
        return err_val("`target_path` is required.");
    }
    let target = target_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let target_p = Path::new(&target);
        if !target_p.exists() {
            fs::create_dir_all(target_p).map_err(|e| e.to_string())?;
        }
        let dot_git = target_p.join(".git");
        if dot_git.exists() {
            return Err(format!("A .git directory already exists at: {}", target));
        }
        let mut args: Vec<String> = vec!["init".into()];
        if bare.unwrap_or(false) {
            args.push("--bare".into());
        }
        if let Some(b) = initial_branch.as_ref() {
            if !b.is_empty() {
                args.push(format!("--initial-branch={}", b));
            }
        }
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
