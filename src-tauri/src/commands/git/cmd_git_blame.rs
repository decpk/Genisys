use crate::commands::err_val;
use serde_json::{json, Value};

use super::blame::{build_blame_response, parse_blame_porcelain, run_git_blame_porcelain};

/// Return blame metadata for a contiguous line range of a file inside a
/// local git repository. The response groups per-line pointers with a
/// deduplicated commits map and includes PR / work-item references
/// parsed from each commit's summary.
///
/// Non-git folders or git failures are returned as `{ success: false,
/// error }` — the frontend treats this as a silent no-op.
#[tauri::command]
pub async fn cmd_git_blame(
    root_path: String,
    file_path: String,
    start_line: u32,
    end_line: u32,
) -> Value {
    let rp = root_path.clone();
    let fp = file_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<_, String> {
        let raw = run_git_blame_porcelain(&rp, &fp, start_line, end_line)?;
        let parsed = parse_blame_porcelain(&raw);
        Ok(build_blame_response(parsed))
    })
    .await;

    match res {
        Ok(Ok(response)) => json!({ "success": true, "data": response }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e.to_string()),
    }
}
