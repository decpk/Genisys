use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git config [--global|--system|--local] --get <key>`. Read-only.
/// `scope` is one of `"local"` (default), `"global"`, `"system"`.
#[tauri::command]
pub async fn cmd_git_config_get(
    root_path: String,
    key: String,
    scope: Option<String>,
) -> Value {
    if key.trim().is_empty() {
        return err_val("`key` is required.");
    }
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["config".into()];
        let s = scope.as_deref().unwrap_or("local");
        match s {
            "global" => args.push("--global".into()),
            "system" => args.push("--system".into()),
            _ => args.push("--local".into()),
        }
        args.push("--get".into());
        args.push(key.clone());
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
