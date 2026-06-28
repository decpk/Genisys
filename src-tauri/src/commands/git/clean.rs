use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_read, run_git_write};
use serde_json::{json, Value};

/// `git clean [-n | -f] [-d] [-x] -- <paths...>`. With
/// `dry_run=true`, calls `-n` and uses `run_git_read` (no FS watcher
/// suppression). Otherwise uses `-f` and is destructive.
#[tauri::command]
pub async fn cmd_git_clean(
    root_path: String,
    paths: Option<Vec<String>>,
    include_ignored: Option<bool>,
    include_directories: Option<bool>,
    dry_run: Option<bool>,
) -> Value {
    let rp = root_path.clone();
    let dry = dry_run.unwrap_or(false);
    if !dry {
        mark_self_write(&rp);
    }
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["clean".into()];
        if dry {
            args.push("-n".into());
        } else {
            args.push("-f".into());
        }
        if include_directories.unwrap_or(false) {
            args.push("-d".into());
        }
        if include_ignored.unwrap_or(false) {
            args.push("-x".into());
        }
        if let Some(ps) = paths.as_ref() {
            if !ps.is_empty() {
                args.push("--".into());
                for p in ps {
                    args.push(p.clone());
                }
            }
        }
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let stdout = if dry {
            run_git_read(&rp, &str_args)?
        } else {
            run_git_write(&rp, &str_args)?
        };
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
