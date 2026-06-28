use super::ZOOM_LEVEL;
use std::sync::atomic::Ordering;

#[tauri::command]
pub fn cmd_zoom_in(webview: tauri::Webview) -> f64 {
    let next = (ZOOM_LEVEL.load(Ordering::Relaxed) + 1).min(10);
    ZOOM_LEVEL.store(next, Ordering::Relaxed);
    let _ = webview.set_zoom(1.0 + next as f64 * 0.1);
    next as f64 * 0.5
}
