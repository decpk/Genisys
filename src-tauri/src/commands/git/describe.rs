use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git describe` — produce a human-readable name for a commit.
/// Defaults to `--tags` (matches lightweight tags too) and adds
/// `--dirty` when requested.
#[tauri::command]
pub async fn cmd_git_describe(
    root_path: String,
    ref_name: Option<String>,
    dirty: Option<bool>,
    abbrev: Option<u32>,
) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["describe".into(), "--tags".into()];
        if dirty.unwrap_or(false) {
            args.push("--dirty".into());
        }
        if let Some(a) = abbrev {
            args.push(format!("--abbrev={}", a));
        }
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
