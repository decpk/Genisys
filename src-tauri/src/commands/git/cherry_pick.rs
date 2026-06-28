use crate::commands::err_val;
use crate::commands::git::run_git_no_editor::run_git_no_editor;
use crate::commands::git::watcher::mark_self_write;
use serde_json::{json, Value};

/// `git cherry-pick [--no-commit] <commit>...`. Accepts one or
/// more commit SHAs. May produce a conflict — surfaced as
/// `status: "conflict"`. Callers handle via `git_cherry_pick_continue`
/// or `git_cherry_pick_abort`.
#[tauri::command]
pub async fn cmd_git_cherry_pick(
    root_path: String,
    commits: Vec<String>,
    no_commit: Option<bool>,
) -> Value {
    if commits.is_empty() {
        return err_val("`commits` must not be empty.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["cherry-pick".into()];
        if no_commit.unwrap_or(false) {
            args.push("--no-commit".into());
        }
        for c in &commits {
            if !c.is_empty() {
                args.push(c.clone());
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
