use crate::commands::{cmd_with_path, err_val};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_local_file_git_history(root_path: String, file_path: String) -> Value {
    let rp = root_path.clone();
    match tokio::task::spawn_blocking(move || {
        let rel = file_path.trim_start_matches('/');
        let o = cmd_with_path("git").args(["log","--pretty=format:%H%n%an%n%ae%n%ai%n%s","--follow","-50","--",rel])
            .current_dir(&rp).output().map_err(|e| e.to_string())?;
        if !o.status.success() { return Err(String::from_utf8_lossy(&o.stderr).to_string()); }
        let out = String::from_utf8_lossy(&o.stdout);
        let mut entries: Vec<Value> = Vec::new();
        let mut lines = out.lines();
        loop {
            let hash = match lines.next() { Some(h) if !h.is_empty() => h, _ => break };
            let an = lines.next().unwrap_or(""); let ae = lines.next().unwrap_or("");
            let dt = lines.next().unwrap_or(""); let msg = lines.next().unwrap_or("");
            entries.push(serde_json::json!({"hash":hash,"authorName":an,"authorEmail":ae,"date":dt,"message":msg}));
        }
        Ok(serde_json::json!(entries))
    }).await {
        Ok(Ok(data)) => serde_json::json!({"success": true, "data": data}),
        Ok(Err(e)) => err_val(e), Err(e) => err_val(e),
    }
}
