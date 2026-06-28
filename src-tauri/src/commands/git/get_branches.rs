use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

#[tauri::command]
pub async fn cmd_git_get_branches(root_path: String) -> Value {
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let out = run_git_read(
            &root_path,
            &[
                "for-each-ref",
                "--format=%(refname:short)|%(upstream:short)|%(HEAD)",
                "refs/heads",
                "refs/remotes",
            ],
        )?;
        let mut local: Vec<Value> = Vec::new();
        let mut remote: Vec<Value> = Vec::new();
        for line in out.lines() {
            let parts: Vec<&str> = line.splitn(3, '|').collect();
            if parts.is_empty() { continue; }
            let name = parts[0].trim().to_string();
            if name.is_empty() { continue; }
            let upstream = parts.get(1).map(|s| s.trim().to_string()).filter(|s| !s.is_empty());
            let is_current = parts.get(2).map(|s| s.trim() == "*").unwrap_or(false);
            // Remote refs come back as "origin/main" etc.
            // Heuristic: if the ref shows up under refs/remotes git outputs
            // "origin/main"; under refs/heads it's just "main". We treat a
            // ref containing '/' AND no upstream AND not current as remote.
            // Simpler: re-run with for-each-ref limited to refs/remotes? Use
            // the output line membership approach: the for-each-ref order is
            // refs/heads first, then refs/remotes. We rely on the slash.
            if name.contains('/') && upstream.is_none() && !is_current {
                remote.push(json!({ "name": name }));
            } else {
                local.push(json!({
                    "name": name,
                    "upstream": upstream,
                    "isCurrent": is_current,
                }));
            }
        }
        Ok(json!({ "local": local, "remote": remote }))
    })
    .await;
    match res {
        Ok(Ok(data)) => serde_json::json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
