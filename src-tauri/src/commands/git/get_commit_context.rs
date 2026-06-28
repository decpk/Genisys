use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

const MAX_DIFF_BYTES: usize = 60_000;
const RECENT_COMMITS: usize = 20;

/// Returns the staged diff and recent commit subjects. Used by the AI
/// "generate commit message" flow to ground the model with both what
/// changed and the project's commit-message convention.
#[tauri::command]
pub async fn cmd_git_get_commit_context(root_path: String) -> Value {
    match tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let diff_raw = run_git_read(
            &root_path,
            &["diff", "--cached", "--no-color", "-U3", "--stat-width=200"],
        )?;
        let truncated = diff_raw.len() > MAX_DIFF_BYTES;
        let diff = if truncated {
            let cut = diff_raw
                .char_indices()
                .nth(MAX_DIFF_BYTES)
                .map(|(i, _)| i)
                .unwrap_or(MAX_DIFF_BYTES);
            diff_raw[..cut].to_string()
        } else {
            diff_raw
        };

        let log_raw = run_git_read(
            &root_path,
            &[
                "log",
                &format!("--max-count={RECENT_COMMITS}"),
                "--pretty=format:%s",
                "--no-merges",
            ],
        )
        .unwrap_or_default();
        let recent: Vec<String> = log_raw
            .lines()
            .filter(|l| !l.trim().is_empty())
            .map(|l| l.to_string())
            .collect();

        Ok(json!({ "diff": diff, "truncated": truncated, "recentMessages": recent }))
    })
    .await
    {
        Ok(Ok(data)) => json!({"success": true, "data": data}),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
