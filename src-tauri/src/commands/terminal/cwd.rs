use serde_json::{json, Value};
use tauri::State;

use super::state::TerminalManager;

/// Resolve a session's *live* working directory by inspecting its child
/// process. This is the backend fallback for cwd tracking (used by session
/// restore): it works across shells without requiring shell integration.
///
/// Returns `{ success: true, data: { cwd: string | null } }`. `cwd` is `null`
/// when the session is gone or the platform is unsupported (e.g. Windows).
#[tauri::command]
pub async fn cmd_terminal_cwd(
    manager: State<'_, TerminalManager>,
    id: String,
) -> Result<Value, String> {
    let cwd = manager.pid(&id).and_then(read_cwd_for_pid);
    Ok(json!({ "success": true, "data": { "cwd": cwd } }))
}

#[cfg(target_os = "linux")]
fn read_cwd_for_pid(pid: u32) -> Option<String> {
    std::fs::read_link(format!("/proc/{pid}/cwd"))
        .ok()
        .and_then(|p| p.to_str().map(str::to_string))
}

#[cfg(target_os = "macos")]
fn read_cwd_for_pid(pid: u32) -> Option<String> {
    // `lsof -a -d cwd -p <pid> -Fn` emits field-prefixed output; lines starting
    // with 'n' carry the path of the cwd file descriptor.
    let out = std::process::Command::new("lsof")
        .args(["-a", "-d", "cwd", "-p", &pid.to_string(), "-Fn"])
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&out.stdout);
    for line in text.lines() {
        if let Some(rest) = line.strip_prefix('n') {
            let trimmed = rest.trim();
            if !trimmed.is_empty() {
                return Some(trimmed.to_string());
            }
        }
    }
    None
}

#[cfg(not(any(target_os = "linux", target_os = "macos")))]
fn read_cwd_for_pid(_pid: u32) -> Option<String> {
    None
}
