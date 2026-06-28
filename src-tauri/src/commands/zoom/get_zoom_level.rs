use super::ZOOM_LEVEL;
use std::sync::atomic::Ordering;

#[tauri::command]
pub fn cmd_get_zoom_level() -> f64 { ZOOM_LEVEL.load(Ordering::Relaxed) as f64 * 0.5 }
