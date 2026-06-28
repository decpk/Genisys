use crate::commands::{err_val, run_git};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_git_log(root_path: String, max_count: Option<i64>, skip: Option<i64>) -> Value {
    let count = max_count.unwrap_or(50);
    let skip_n = skip.unwrap_or(0);
    match tokio::task::spawn_blocking(move || {
        let mut args = vec!["log".into(), format!("--max-count={count}"),
            "--pretty=format:%H%n%an%n%ae%n%aI%n%s%n%D".into(), "--no-merges".into()];
        if skip_n > 0 { args.push(format!("--skip={skip_n}")); }
        let refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        run_git(&root_path, &refs)
    }).await {
        Ok(Ok(out)) => {
            let mut entries: Vec<Value> = Vec::new();
            let mut lines = out.lines();
            loop {
                let hash = match lines.next() { Some(h) if !h.is_empty() => h, _ => break };
                let an = lines.next().unwrap_or(""); let ae = lines.next().unwrap_or("");
                let dt = lines.next().unwrap_or(""); let msg = lines.next().unwrap_or("");
                let refs = lines.next().unwrap_or("");
                entries.push(serde_json::json!({"hash":hash,"authorName":an,"authorEmail":ae,"date":dt,"message":msg,"refs":refs}));
            }
            serde_json::json!({"success": true, "data": entries})
        }
        Ok(Err(e)) => err_val(e), Err(e) => err_val(e),
    }
}
