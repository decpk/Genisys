use crate::tray::timer_tray::set_timer_tray_title;
use serde_json::Value;

#[tauri::command]
pub fn cmd_set_timer_tray_title(app: tauri::AppHandle, text: String) -> Value {
    match set_timer_tray_title(&app, text) {
        Ok(_) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
