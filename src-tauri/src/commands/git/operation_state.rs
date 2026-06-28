use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};
use std::path::PathBuf;

/// Reports which multi-step git operations are currently in progress
/// in the repository at `root_path`. Inspects the `.git/` directory
/// for well-known marker files / dirs, then asks `git status` whether
/// any working-tree entry is conflicted.
///
/// Returns a JSON object with `success`, plus `data` on success:
/// ```json
/// {
///   "mergeInProgress": bool,
///   "rebaseInProgress": bool,
///   "cherryPickInProgress": bool,
///   "revertInProgress": bool,
///   "bisectInProgress": bool,
///   "amInProgress": bool,
///   "hasConflicts": bool
/// }
/// ```
#[tauri::command]
pub async fn cmd_git_operation_state(root_path: String) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let git_dir = run_git_read(&rp, &["rev-parse", "--git-dir"])?
            .trim()
            .to_string();

        // `git-dir` may be relative to `root_path`; resolve to absolute.
        let git_dir_path: PathBuf = if PathBuf::from(&git_dir).is_absolute() {
            PathBuf::from(&git_dir)
        } else {
            PathBuf::from(&rp).join(&git_dir)
        };

        let exists = |rel: &str| git_dir_path.join(rel).exists();

        let merge_in_progress = exists("MERGE_HEAD");
        let cherry_pick_in_progress = exists("CHERRY_PICK_HEAD");
        let revert_in_progress = exists("REVERT_HEAD");
        let bisect_in_progress = exists("BISECT_LOG");
        let rebase_in_progress = exists("rebase-merge") || exists("rebase-apply");
        // `git am` uses the `rebase-apply` directory with an `applying`
        // marker; if `applying` exists treat it as `am` (and not rebase).
        let am_in_progress = git_dir_path.join("rebase-apply").join("applying").exists();
        let rebase_in_progress = rebase_in_progress && !am_in_progress;

        // Conflict detection — porcelain v2 marks unmerged entries with
        // a leading `u`. Cheaper than re-parsing snapshot.
        let status_out = run_git_read(
            &rp,
            &["status", "--porcelain=v2", "--untracked-files=no"],
        )?;
        let has_conflicts = status_out.lines().any(|l| l.starts_with("u "));

        Ok(json!({
            "mergeInProgress": merge_in_progress,
            "rebaseInProgress": rebase_in_progress,
            "cherryPickInProgress": cherry_pick_in_progress,
            "revertInProgress": revert_in_progress,
            "bisectInProgress": bisect_in_progress,
            "amInProgress": am_in_progress,
            "hasConflicts": has_conflicts,
        }))
    })
    .await;

    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
