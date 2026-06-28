use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git grep <pattern> [<ref>] [-- <include>]` — search tracked
/// content. With `ref_name` the search runs against that revision
/// (history search). Caps output to `max_results` lines.
#[tauri::command]
pub async fn cmd_git_grep(
    root_path: String,
    pattern: String,
    ref_name: Option<String>,
    include_pattern: Option<String>,
    max_results: Option<u32>,
) -> Value {
    if pattern.trim().is_empty() {
        return err_val("`pattern` is required.");
    }
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["grep".into(), "-n".into(), "-I".into()];
        args.push(pattern.clone());
        if let Some(r) = ref_name.as_ref() {
            if !r.is_empty() {
                args.push(r.clone());
            }
        }
        if let Some(inc) = include_pattern.as_ref() {
            if !inc.is_empty() {
                args.push("--".into());
                args.push(inc.clone());
            }
        }
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let stdout = run_git_read(&rp, &str_args)?;
        let truncated = match max_results {
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
