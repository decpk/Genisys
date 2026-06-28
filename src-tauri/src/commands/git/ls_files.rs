use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git ls-files` with optional filters. Defaults to staged (cached)
/// files. `modified=true` adds `--modified`; `untracked=true` adds
/// `--others --exclude-standard`. Trailing `patterns` narrow the
/// listing (passed after `--`).
#[tauri::command]
pub async fn cmd_git_ls_files(
    root_path: String,
    patterns: Option<Vec<String>>,
    staged: Option<bool>,
    modified: Option<bool>,
    untracked: Option<bool>,
) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["ls-files".into()];
        let show_staged = staged.unwrap_or(true);
        if show_staged {
            args.push("--cached".into());
        }
        if modified.unwrap_or(false) {
            args.push("--modified".into());
        }
        if untracked.unwrap_or(false) {
            args.push("--others".into());
            args.push("--exclude-standard".into());
        }
        let pats = patterns.unwrap_or_default();
        let pats: Vec<&String> = pats.iter().filter(|s| !s.is_empty()).collect();
        if !pats.is_empty() {
            args.push("--".into());
            for p in pats {
                args.push(p.clone());
            }
        }
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let stdout = run_git_read(&rp, &str_args)?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
