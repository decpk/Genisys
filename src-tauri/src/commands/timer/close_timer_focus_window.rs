use serde_json::Value;
use tauri::Manager;

#[tauri::command]
pub fn cmd_close_timer_focus_window(app: tauri::AppHandle) -> Value {
    if let Some(w) = app.get_webview_window("timer-focus") {
        let _ = w.hide();
    }
    serde_json::json!({ "success": true })
}
