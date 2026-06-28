use crate::commands::git::watcher::mark_self_write;
use crate::commands::{err_val, run_git_write};
use serde_json::{json, Value};

/// `git submodule update [--init] [--recursive] [-- <paths>]`. Used
/// to fetch and check out the pinned commits of the submodules.
#[tauri::command]
pub async fn cmd_git_submodule_update(
    root_path: String,
    init: Option<bool>,
    recursive: Option<bool>,
    paths: Option<Vec<String>>,
) -> Value {
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["submodule".into(), "update".into()];
        if init.unwrap_or(false) {
            args.push("--init".into());
        }
        if recursive.unwrap_or(false) {
            args.push("--recursive".into());
        }
        let paths_vec = paths.unwrap_or_default();
        let filtered: Vec<&String> = paths_vec.iter().filter(|s| !s.is_empty()).collect();
        if !filtered.is_empty() {
            args.push("--".into());
            for p in filtered {
                args.push(p.clone());
            }
        }
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
