use crate::commands::cmd_with_path;
use serde_json::{json, Value};

/// Run a git command with all interactive editors disabled.
/// Sets `GIT_EDITOR=true` and `GIT_SEQUENCE_EDITOR=true` so
/// `*_continue` / merge / cherry-pick operations never hang waiting
/// for an editor that doesn't exist in our subprocess context.
///
/// On non-zero exit, returns `Err` with stderr (unless the stderr
/// matches a conflict marker, in which case returns `Ok` with
/// `status: "conflict"`).
pub fn run_git_no_editor(root: &str, args: &[&str]) -> Result<Value, String> {
    let output = cmd_with_path("git")
        .env("GIT_EDITOR", "true")
        .env("GIT_SEQUENCE_EDITOR", "true")
        .args(args)
        .current_dir(root)
        .output()
        .map_err(|e| e.to_string())?;
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    if output.status.success() {
        return Ok(json!({ "status": "ok", "stdout": stdout, "stderr": stderr }));
    }
    let lower = stderr.to_lowercase();
    let is_conflict = lower.contains("conflict")
        || lower.contains("automatic merge failed")
        || lower.contains("could not apply")
        || lower.contains("after resolving the conflicts");
    if is_conflict {
        Ok(json!({ "status": "conflict", "stdout": stdout, "stderr": stderr }))
    } else {
        Err(stderr)
    }
}
