use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git ls-tree <ref> [-- <path>]` — list the tree of a commit. Use
/// `recursive=true` for `-r` (full file paths, no tree-only entries).
#[tauri::command]
pub async fn cmd_git_ls_tree(
    root_path: String,
    ref_name: String,
    path: Option<String>,
    recursive: Option<bool>,
) -> Value {
    if ref_name.trim().is_empty() {
        return err_val("`ref_name` is required.");
    }
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["ls-tree".into()];
        if recursive.unwrap_or(false) {
            args.push("-r".into());
        }
        args.push(ref_name.clone());
        if let Some(p) = path.as_ref() {
            if !p.is_empty() {
                args.push("--".into());
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
