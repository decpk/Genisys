use std::sync::Arc;
use tauri::State;
use super::monitor::ClipboardMonitorControl;

#[tauri::command]
pub fn cmd_set_clipboard_add_once(
    enabled: bool,
    control: State<'_, Arc<ClipboardMonitorControl>>,
) -> serde_json::Value {
    control.set_add_once(enabled);
    serde_json::json!({ "success": true, "addOnce": enabled })
}
