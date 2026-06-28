use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git show <ref>[:<path>]` — display commit metadata + diff, or
/// the contents of a tracked file at a specific commit. Optional
/// `max_lines` truncates very large outputs at the Rust layer.
#[tauri::command]
pub async fn cmd_git_show(
    root_path: String,
    ref_name: String,
    path: Option<String>,
    max_lines: Option<u32>,
) -> Value {
    if ref_name.trim().is_empty() {
        return err_val("`ref_name` is required.");
    }
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let target = match path.as_deref() {
            Some(p) if !p.is_empty() => format!("{}:{}", ref_name, p),
            _ => ref_name.clone(),
        };
        let stdout = run_git_read(&rp, &["show", &target])?;
        let truncated = match max_lines {
            Some(n) if n > 0 => stdout
                .lines()
                .take(n as usize)
                .collect::<Vec<_>>()
                .join("\n"),
            _ => stdout,
        };
        Ok(json!({ "stdout": truncated }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
