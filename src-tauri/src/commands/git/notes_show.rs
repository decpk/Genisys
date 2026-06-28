use crate::commands::{err_val, run_git_read};
use serde_json::{json, Value};

/// `git notes show [<ref>]` — print the note attached to a commit
/// (default HEAD). Read-only.
#[tauri::command]
pub async fn cmd_git_notes_show(root_path: String, ref_name: Option<String>) -> Value {
    let rp = root_path.clone();
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec!["notes".into(), "show".into()];
        if let Some(r) = ref_name.as_ref() {
            if !r.is_empty() {
                args.push(r.clone());
            }
        }
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let stdout = run_git_read(&rp, &str_args)?;
        Ok(json!({ "stdout": stdout }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
