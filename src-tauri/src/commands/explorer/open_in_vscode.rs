use serde_json::Value;
use std::process::Command;

#[tauri::command]
pub async fn cmd_open_in_vscode(path: String) -> Value {
    let result = Command::new("code").arg(&path).spawn();

    match result {
        Ok(_) => serde_json::json!({"success": true}),
        Err(e) => {
            let error_code = if e.kind() == std::io::ErrorKind::NotFound {
                "cli_not_found"
            } else {
                "spawn_failed"
            };
            serde_json::json!({"success": false, "error": error_code, "message": e.to_string()})
        }
    }
}
