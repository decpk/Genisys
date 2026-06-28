use crate::commands::run_git_write;
use serde_json::{json, Value};

/// Run a mutating git command that may produce a conflict (merge,
/// rebase, cherry-pick, revert, ...). When git exits non-zero with
/// stderr that looks like a conflict marker, we return an `Ok` JSON
/// value with `status: "conflict"` so the AI can call
/// `git_operation_state` and continue with the appropriate
/// `*_continue` / `*_abort` tool instead of treating the operation
/// as a hard failure.
///
/// Returns `Err` only for non-conflict errors (bad ref, permission,
/// etc.).
pub fn run_git_or_conflict(root: &str, args: &[&str]) -> Result<Value, String> {
    match run_git_write(root, args) {
        Ok(stdout) => Ok(json!({ "status": "ok", "stdout": stdout, "stderr": "" })),
        Err(e) => {
            let lower = e.to_lowercase();
            let is_conflict = lower.contains("conflict")
                || lower.contains("automatic merge failed")
                || lower.contains("could not apply")
                || lower.contains("after resolving the conflicts");
            if is_conflict {
                Ok(json!({ "status": "conflict", "stdout": "", "stderr": e }))
            } else {
                Err(e)
            }
        }
    }
}
