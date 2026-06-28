use crate::tray::timer_tray::set_timer_tray_visible;
use serde_json::Value;

#[tauri::command]
pub fn cmd_set_timer_tray_visible(app: tauri::AppHandle, visible: bool) -> Value {
    match set_timer_tray_visible(&app, visible) {
        Ok(_) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
