use std::sync::Arc;
use tauri::State;
use super::monitor::ClipboardMonitorControl;

/// Enable or disable system clipboard capture. Driven by whether the
/// Clipboard app is enabled in settings: when the app is disabled the monitor
/// must not read or store anything the user copies. Existing history is kept
/// and capture resumes when the app is re-enabled.
#[tauri::command]
pub fn cmd_set_clipboard_enabled(
    enabled: bool,
    control: State<'_, Arc<ClipboardMonitorControl>>,
) -> serde_json::Value {
    control.set_enabled(enabled);
    serde_json::json!({ "success": true, "enabled": enabled })
}
