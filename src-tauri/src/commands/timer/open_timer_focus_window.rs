use serde_json::Value;
use tauri::Manager;

#[tauri::command]
pub fn cmd_open_timer_focus_window(app: tauri::AppHandle) -> Value {
    if let Some(w) = app.get_webview_window("timer-focus") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
        return serde_json::json!({ "success": true });
    }
    serde_json::json!({ "success": false, "error": "timer-focus window not found" })
}
