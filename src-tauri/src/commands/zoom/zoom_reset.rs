use super::ZOOM_LEVEL;
use std::sync::atomic::Ordering;

#[tauri::command]
pub fn cmd_zoom_reset(webview: tauri::Webview) -> f64 {
    ZOOM_LEVEL.store(0, Ordering::Relaxed);
    let _ = webview.set_zoom(1.0);
    0.0
}
