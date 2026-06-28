use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::fs::File;
use std::process::Stdio;

/// `git archive` — produces a snapshot of `ref_name` in `format`
/// (default `tar`). When `output_path` is provided, the archive is
/// written to disk and `output_path` is returned. Otherwise, only
/// the byte count is returned (binary stdout is not JSON-safe).
#[tauri::command]
pub async fn cmd_git_archive(
    root_path: String,
    ref_name: String,
    format: Option<String>,
    output_path: Option<String>,
) -> Value {
    if ref_name.trim().is_empty() {
        return err_val("`ref_name` is required.");
    }
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let fmt = format
            .as_deref()
            .map(|s| if s.is_empty() { "tar" } else { s })
            .unwrap_or("tar")
            .to_string();
        let format_arg = format!("--format={}", fmt);
        let args: Vec<&str> = vec!["archive", &format_arg, &ref_name];
        if let Some(path) = output_path.as_deref() {
            if !path.is_empty() {
                let file = File::create(path).map_err(|e| e.to_string())?;
                let status = cmd_with_path("git")
                    .args(&args)
                    .current_dir(&rp)
                    .stdout(Stdio::from(file))
                    .stderr(Stdio::piped())
                    .status()
                    .map_err(|e| e.to_string())?;
                if !status.success() {
                    return Err("git archive failed.".into());
                }
                return Ok(json!({ "outputPath": path, "format": fmt }));
            }
        }
        // No output_path → run the archive but only report byte size.
        let output = cmd_with_path("git")
            .args(&args)
            .current_dir(&rp)
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(json!({ "bytes": output.stdout.len(), "format": fmt }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
