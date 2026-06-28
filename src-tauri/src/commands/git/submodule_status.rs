use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git submodule status [--recursive]`. Read-only.
#[tauri::command]
pub async fn cmd_git_submodule_status(
    root_path: String,
    recursive: Option<bool>,
) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["submodule".into(), "status".into()];
        if recursive.unwrap_or(false) {
            args.push("--recursive".into());
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
