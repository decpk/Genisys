use crate::commands::{err_val, run_git};
use serde_json::Value;

#[tauri::command]
pub async fn cmd_get_git_worktrees(root_path: String) -> Value {
    match tokio::task::spawn_blocking(move || run_git(&root_path, &["worktree","list","--porcelain"])).await {
        Ok(Ok(out)) => {
            let worktrees: Vec<Value> = out.split("\n\n").filter(|b| !b.trim().is_empty()).map(|block| {
                let (mut path, mut head, mut branch) = ("","","");
                let mut is_bare = false;
                for line in block.lines() {
                    if let Some(r) = line.strip_prefix("worktree ") { path = r; }
                    else if let Some(r) = line.strip_prefix("HEAD ") { head = r; }
                    else if let Some(r) = line.strip_prefix("branch ") { branch = r.strip_prefix("refs/heads/").unwrap_or(r); }
                    else if line == "bare" { is_bare = true; }
                }
                serde_json::json!({"path":path,"head":head,"branch":branch,"isBare":is_bare})
            }).collect();
            serde_json::json!({"success": true, "data": worktrees})
        }
        Ok(Err(e)) => err_val(e), Err(e) => err_val(e),
    }
}
