use crate::commands::{err_val, run_git};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_local_file_at_commit(root_path: String, file_path: String, commit_hash: String) -> Value {
    match tokio::task::spawn_blocking(move || {
        let rel = file_path.trim_start_matches('/');
        let spec = format!("{commit_hash}:{rel}");
        run_git(&root_path, &["show", &spec])
    }).await {
        Ok(Ok(data)) => serde_json::json!({"success": true, "data": data}),
        Ok(Err(_)) => serde_json::json!({"success": true, "data": ""}),
        Err(e) => err_val(e),
    }
}
