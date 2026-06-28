use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git tag --list [pattern]`. Read-only. Returns newline-separated
/// tag names.
#[tauri::command]
pub async fn cmd_git_tag_list(root_path: String, pattern: Option<String>) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["tag".into(), "--list".into()];
        if let Some(p) = pattern.as_ref() {
            if !p.is_empty() {
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
