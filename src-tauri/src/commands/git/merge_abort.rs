use crate::commands::err_val;
use crate::commands::git::run_git_no_editor::run_git_no_editor;
use crate::commands::git::watcher::mark_self_write;
use serde_json::{json, Value};

/// `git merge --abort`. Restores HEAD and worktree to the pre-merge
/// state when an in-progress merge has unresolved conflicts.
#[tauri::command]
pub async fn cmd_git_merge_abort(root_path: String) -> Value {
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        run_git_no_editor(&rp, &["merge", "--abort"])
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
