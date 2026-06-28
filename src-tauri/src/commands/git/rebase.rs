use crate::commands::err_val;
use crate::commands::git::run_git_no_editor::run_git_no_editor;
use crate::commands::git::watcher::mark_self_write;
use serde_json::{json, Value};

/// `git rebase [<upstream>] [<branch>] [--onto <newbase>]`.
///
/// Interactive rebase is NOT supported (no PTY); callers passing
/// `interactive=true` get an error pointing them to use the
/// fallback `sequence_editor` parameter (writes a precomputed todo
/// list before the rebase begins) — currently rejected.
#[tauri::command]
pub async fn cmd_git_rebase(
    root_path: String,
    upstream: Option<String>,
    branch: Option<String>,
    onto: Option<String>,
    interactive: Option<bool>,
) -> Value {
    if interactive.unwrap_or(false) {
        return err_val(
            "Interactive rebase is not supported in this UI. Use `git_rebase` with explicit `onto`/`upstream`/`branch` or open a terminal.",
        );
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["rebase".into()];
        if let Some(o) = onto.as_ref() {
            if !o.is_empty() {
                args.push("--onto".into());
                args.push(o.clone());
            }
        }
        if let Some(u) = upstream.as_ref() {
            if !u.is_empty() {
                args.push(u.clone());
            }
        }
        if let Some(b) = branch.as_ref() {
            if !b.is_empty() {
                args.push(b.clone());
            }
        }
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        run_git_no_editor(&rp, &str_args)
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
