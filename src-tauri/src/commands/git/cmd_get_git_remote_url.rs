use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// Return `remote.origin.url` for the given local repository, or
/// `{ success: true, data: null }` if no `origin` remote is configured.
/// Errors (non-git folder, git failure) come back as `{ success: false, error }`.
///
/// The frontend uses this to build deep-links into the remote host (e.g. GitHub)
/// for blame-hover PR / work-item references.
#[tauri::command]
pub async fn cmd_get_git_remote_url(root_path: String) -> Value {
    let res = tokio::task::spawn_blocking(move || -> Result<Option<String>, String> {
        match run_git_read(&root_path, &["config", "--get", "remote.origin.url"]) {
            Ok(out) => {
                let trimmed = out.trim();
                if trimmed.is_empty() {
                    Ok(None)
                } else {
                    Ok(Some(trimmed.to_string()))
                }
            }
            // `git config --get` returns exit 1 with empty stderr when the
            // key is missing. Treat that as "no remote configured".
            Err(e) if e.trim().is_empty() => Ok(None),
            Err(e) => Err(e),
        }
    })
    .await;

    match res {
        Ok(Ok(url)) => json!({ "success": true, "data": url }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e.to_string()),
    }
}
