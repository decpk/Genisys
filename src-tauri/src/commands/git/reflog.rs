use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git reflog show [<ref>] -n <max_count>`. Read-only; surfaces
/// HEAD movement history so the AI can locate a "lost" commit when
/// recovering from a bad reset/rebase.
#[tauri::command]
pub async fn cmd_git_reflog(
    root_path: String,
    ref_name: Option<String>,
    max_count: Option<u32>,
) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let max = max_count.unwrap_or(50);
        let max_str = format!("-n{max}");
        let mut args: Vec<String> = vec!["reflog".into(), "show".into(), max_str];
        if let Some(r) = ref_name.as_ref() {
            if !r.is_empty() {
                args.push(r.clone());
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
