use crate::commands::{err_val, run_git};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_git_status(root_path: String) -> Value {
    let rp = root_path.clone();
    match tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let git_root = run_git(&rp, &["rev-parse","--show-toplevel"])?.trim().to_string();
        let out = run_git(&rp, &["status","--porcelain","-uall"])?;
        let files: Vec<Value> = out.lines().filter(|l| l.len() >= 3).map(|l|
            serde_json::json!({"indexStatus": &l[0..1], "workTreeStatus": &l[1..2], "path": l[3..].to_string()})
        ).collect();
        Ok(serde_json::json!({"gitRoot": git_root, "files": files}))
    }).await {
        Ok(Ok(data)) => serde_json::json!({"success": true, "data": data}),
        Ok(Err(e)) => err_val(e), Err(e) => err_val(e),
    }
}
