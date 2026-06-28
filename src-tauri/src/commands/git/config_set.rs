use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git config [--global|--system|--local] <key> <value>` — writes
/// the config entry. `scope` accepts `"local"` (default), `"global"`,
/// `"system"`.
#[tauri::command]
pub async fn cmd_git_config_set(
    root_path: String,
    key: String,
    value: String,
    scope: Option<String>,
) -> Value {
    if key.trim().is_empty() {
        return err_val("`key` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["config".into()];
        let s = scope.as_deref().unwrap_or("local");
        match s {
            "global" => args.push("--global".into()),
            "system" => args.push("--system".into()),
            _ => args.push("--local".into()),
        }
        args.push(key.clone());
        args.push(value.clone());
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let stdout = run_git_write(&rp, &str_args)?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
