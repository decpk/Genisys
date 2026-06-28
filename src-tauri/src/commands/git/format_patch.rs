use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git format-patch <range> --stdout` — produces patches for the
/// commits in `range` and returns them as a single string. Use for
/// downstream `git am` or `git apply` flows.
#[tauri::command]
pub async fn cmd_git_format_patch(root_path: String, range: String) -> Value {
    if range.trim().is_empty() {
        return err_val("`range` is required (e.g. \"main..HEAD\" or \"-1\").");
    }
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let stdout = run_git_read(&rp, &["format-patch", &range, "--stdout"])?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
