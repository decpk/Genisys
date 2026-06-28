use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git stash show [-p | --stat] [stash_ref]`. Read-only; `format`
/// must be either `"patch"` or `"stat"` (default `stat`).
#[tauri::command]
pub async fn cmd_git_stash_show(
    root_path: String,
    stash_ref: Option<String>,
    format: Option<String>,
) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let fmt = format.as_deref().unwrap_or("stat");
        let flag = match fmt {
            "patch" => "-p",
            "stat" => "--stat",
            other => return Err(format!("Invalid format '{other}'. Use 'patch' or 'stat'.")),
        };
        let mut args: Vec<String> = vec!["stash".into(), "show".into(), flag.into()];
        if let Some(s) = stash_ref.as_ref() {
            if !s.is_empty() {
                args.push(s.clone());
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
