use crate::commands::git::watcher::mark_self_write;
use crate::commands::{cmd_with_path, err_val};
use serde_json::{json, Value};
use std::io::Write;
use std::process::Stdio;

/// `git notes add -f -F - [<ref>]` — attach (or overwrite) a note
/// on a commit. The message is piped via stdin so it never hits the
/// command line. Defaults to HEAD when `ref_name` is omitted.
#[tauri::command]
pub async fn cmd_git_notes_add(
    root_path: String,
    message: String,
    ref_name: Option<String>,
) -> Value {
    if message.is_empty() {
        return err_val("`message` is required.");
    }
    let rp = root_path.clone();
    mark_self_write(&rp);
    let res = tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let mut args: Vec<String> = vec![
            "notes".into(),
            "add".into(),
            "-f".into(),
            "-F".into(),
            "-".into(),
        ];
        if let Some(r) = ref_name.as_ref() {
            if !r.is_empty() {
                args.push(r.clone());
            }
        }
        let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let mut child = cmd_with_path("git")
            .args(&str_args)
            .current_dir(&rp)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        if let Some(stdin) = child.stdin.as_mut() {
            stdin
                .write_all(message.as_bytes())
                .map_err(|e| e.to_string())?;
        }
        let output = child.wait_with_output().map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(json!({ "stdout": String::from_utf8_lossy(&output.stdout).to_string() }))
    })
    .await;
    match res {
        Ok(Ok(data)) => json!({ "success": true, "data": data }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
