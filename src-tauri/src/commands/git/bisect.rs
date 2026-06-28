use crate::commands::err_val;
use crate::commands::git::run_git_no_editor::run_git_no_editor;
use crate::commands::git::watcher::mark_self_write;
use serde_json::{json, Value};

/// `git bisect <op> [args...]` — single op-routed command covering
/// the rarely-used bisect family. Allowed `op` values:
/// `start | good | bad | skip | reset`.
///
/// `start` accepts optional `bad` and `good` refs as the two args.
/// `good`, `bad`, `skip` accept an optional commit ref (defaults to
/// HEAD when omitted).
/// `reset` accepts no args.
#[tauri::command]
pub async fn cmd_git_bisect(
    root_path: String,
    op: String,
    args: Option<Vec<String>>,
) -> Value {
    const ALLOWED: &[&str] = &["start", "good", "bad", "skip", "reset"];
    if !ALLOWED.contains(&op.as_str()) {
        return err_val(format!(
            "`op` must be one of: {} (got '{}')",
            ALLOWED.join(", "),
            op
        ));
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let extra = args.unwrap_or_default();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut cmd_args: Vec<String> = vec!["bisect".into(), op.clone()];
        for a in &extra {
            if !a.is_empty() {
                cmd_args.push(a.clone());
            }
        }
        let str_args: Vec<&str> = cmd_args.iter().map(|s| s.as_str()).collect();
        run_git_no_editor(&rp, &str_args)
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
