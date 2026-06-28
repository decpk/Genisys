use serde_json::{json, Value};

use super::default_shell::resolve_default_shell;

#[tauri::command]
pub async fn cmd_terminal_default_shell() -> Value {
    let s = resolve_default_shell();
    json!({ "success": true, "data": { "shell": s.shell, "args": s.args } })
}
