use clipboard_rs::{
    Clipboard, ClipboardContext, ClipboardHandler, ClipboardWatcher, ClipboardWatcherContext,
    common::RustImage,
};
use crate::database::{save_clipboard_item_db, prune_clipboard_items_db, move_clipboard_item_to_top_db, Database};
use crate::types::ClipboardItem;
use super::analysis::analyze_text;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicI64, AtomicU64, Ordering};
use std::time::{Instant, SystemTime, UNIX_EPOCH};
use tauri::{Emitter, Manager};
use uuid::Uuid;
use chrono::Utc;

/// Lock-free control for temporarily suppressing the clipboard monitor
/// (e.g. after a "Clear Unpinned" operation so the monitor doesn't
/// immediately re-save the current system clipboard content).
pub struct ClipboardMonitorControl {
    suppress_until: AtomicU64, // millis since UNIX_EPOCH
    max_items: AtomicI64,
    add_once: AtomicBool,
    enabled: AtomicBool,
}

impl ClipboardMonitorControl {
    pub fn new() -> Self {
        Self {
            suppress_until: AtomicU64::new(0),
            max_items: AtomicI64::new(500),
            add_once: AtomicBool::new(false),
            enabled: AtomicBool::new(true),
        }
    }

    /// Suppress the monitor for the given number of milliseconds.
    pub fn suppress_for(&self, millis: u64) {
        let until = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
            + millis;
        self.suppress_until.store(until, Ordering::Relaxed);
    }

    /// Returns `true` if the monitor is currently suppressed.
    fn is_suppressed(&self) -> bool {
        let until = self.suppress_until.load(Ordering::Relaxed);
        if until == 0 {
            return false;
        }
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        now < until
    }

    /// Update the maximum number of clipboard items to retain.
    pub fn set_max_items(&self, max: i64) {
        self.max_items.store(max, Ordering::Relaxed);
    }

    /// Get the current maximum items limit.
    pub fn get_max_items(&self) -> i64 {
        self.max_items.load(Ordering::Relaxed)
    }

    /// Update the "add once" deduplication mode.
    pub fn set_add_once(&self, enabled: bool) {
        self.add_once.store(enabled, Ordering::Relaxed);
    }

    /// Returns `true` if "add once" mode is enabled.
    pub fn is_add_once(&self) -> bool {
        self.add_once.load(Ordering::Relaxed)
    }

    /// Enable or disable clipboard capture entirely. When disabled the monitor
    /// reads nothing and saves nothing — the Clipboard app is off, so it must
    /// not access the system clipboard at all. Existing history is preserved;
    /// capture resumes when re-enabled.
    pub fn set_enabled(&self, enabled: bool) {
        self.enabled.store(enabled, Ordering::Relaxed);
    }

    /// Returns `true` if clipboard capture is enabled (the default).
    pub fn is_enabled(&self) -> bool {
        self.enabled.load(Ordering::Relaxed)
    }
}

struct ClipboardMonitor {
    ctx: ClipboardContext,
    db: Arc<Database>,
    images_dir: std::path::PathBuf,
    app_handle: tauri::AppHandle,
    last_change: Instant,
    control: Arc<ClipboardMonitorControl>,
}

impl ClipboardHandler for ClipboardMonitor {
    fn on_clipboard_change(&mut self) {
        // Skip entirely when the Clipboard app is disabled — don't even read the
        // system clipboard. Existing history is preserved; capture resumes when
        // the app is re-enabled.
        if !self.control.is_enabled() {
            return;
        }

        // Skip if the monitor is temporarily suppressed (e.g. after a clear operation)
        if self.control.is_suppressed() {
            return;
        }

        // Debounce: skip if less than 500ms since last change (macOS fires multiple events per copy)
        let now = Instant::now();
        if now.duration_since(self.last_change).as_millis() < 500 {
            return;
        }
        self.last_change = now;

        // Try to read text first
        if let Ok(text) = self.ctx.get_text() {
            if !text.is_empty() {
                let hash = compute_hash(text.as_bytes());
                let analysis = analyze_text(&text);
                let item = ClipboardItem {
                    id: Uuid::new_v4().to_string(),
                    content_type: "text".to_string(),
                    text_content: Some(text.clone()),
                    image_path: None,
                    thumbnail_path: None,
                    is_pinned: false,
                    created_at: Utc::now().to_rfc3339(),
                    content_hash: hash,
                    byte_size: text.len() as i64,
                    labels: vec![],
                    image_description: None,
                    analysis_status: "none".to_string(),
                    extracted_text: None,
                    smart_categories: analysis.smart_categories,
                    sensitivity_level: analysis.sensitivity_level,
                    sensitivity_matches: analysis.sensitivity_matches,
                };
                // "Add once" mode: move existing item to top instead of creating duplicate
                if self.control.is_add_once() {
                    if let Some(moved) = move_clipboard_item_to_top_db(&self.db, &item.content_hash) {
                        let _ = self.app_handle.emit("clipboard-item-moved", &moved);
                        return;
                    }
                }
                if save_clipboard_item_db(&self.db, &item) {
                    let _ = self.app_handle.emit("clipboard-new-item", &item);
                    let max = self.control.get_max_items();
                    let pruned = prune_clipboard_items_db(&self.db, max);
                    cleanup_image_files(&self.images_dir, &pruned);
                }
                return;
            }
        }

        // Try to read image
        if let Ok(img) = self.ctx.get_image() {
            let id = Uuid::new_v4().to_string();
            let image_filename = format!("{}.png", &id);
            let thumb_filename = format!("{}_thumb.png", &id);
            let image_path = self.images_dir.join(&image_filename);
            let thumb_path = self.images_dir.join(&thumb_filename);

            // Save full image
            if img.save_to_path(&image_path.to_string_lossy()).is_ok() {
                // Generate thumbnail (200px width)
                let _ = img
                    .thumbnail(200, 200)
                    .and_then(|thumb| thumb.save_to_path(&thumb_path.to_string_lossy()));

                let byte_size = std::fs::metadata(&image_path)
                    .map(|m| m.len() as i64)
                    .unwrap_or(0);
                let hash = compute_hash(&std::fs::read(&image_path).unwrap_or_default());

                let item = ClipboardItem {
                    id,
                    content_type: "image".to_string(),
                    text_content: None,
                    image_path: Some(image_filename.clone()),
                    thumbnail_path: Some(thumb_filename),
                    is_pinned: false,
                    created_at: Utc::now().to_rfc3339(),
                    content_hash: hash,
                    byte_size,
                    labels: vec![],
                    image_description: None,
                    analysis_status: "none".to_string(),
                    extracted_text: None,
                    smart_categories: vec![],
                    sensitivity_level: "none".to_string(),
                    sensitivity_matches: vec![],
                };
                // "Add once" mode: move existing item to top instead of creating duplicate
                if self.control.is_add_once() {
                    if let Some(moved) = move_clipboard_item_to_top_db(&self.db, &item.content_hash) {
                        // Clean up the just-written image + thumbnail files
                        let _ = std::fs::remove_file(&image_path);
                        let _ = std::fs::remove_file(&thumb_path);
                        let _ = self.app_handle.emit("clipboard-item-moved", &moved);
                        return;
                    }
                }
                if save_clipboard_item_db(&self.db, &item) {
                    let _ = self.app_handle.emit("clipboard-new-item", &item);
                    let max = self.control.get_max_items();
                    let pruned = prune_clipboard_items_db(&self.db, max);
                    cleanup_image_files(&self.images_dir, &pruned);
                } else {
                    // Duplicate detected — clean up the just-written files
                    let _ = std::fs::remove_file(&image_path);
                    let _ = std::fs::remove_file(&thumb_path);
                }
            }
        }
    }
}

fn compute_hash(data: &[u8]) -> String {
    use std::hash::{Hash, Hasher};
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    data.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn cleanup_image_files(
    images_dir: &std::path::Path,
    paths: &[(Option<String>, Option<String>)],
) {
    for (img, thumb) in paths {
        if let Some(p) = img {
            let _ = std::fs::remove_file(images_dir.join(p));
        }
        if let Some(p) = thumb {
            let _ = std::fs::remove_file(images_dir.join(p));
        }
    }
}

pub fn start_clipboard_monitor(
    app_handle: tauri::AppHandle,
    db: Arc<Database>,
    control: Arc<ClipboardMonitorControl>,
) -> clipboard_rs::WatcherShutdown {
    let images_dir = app_handle
        .path()
        .app_data_dir()
        .expect("app data dir")
        .join("clipboard-images");
    std::fs::create_dir_all(&images_dir).ok();

    let monitor = ClipboardMonitor {
        ctx: ClipboardContext::new().expect("clipboard context"),
        db,
        images_dir,
        app_handle,
        last_change: Instant::now(),
        control,
    };

    let mut watcher = ClipboardWatcherContext::new().expect("clipboard watcher");
    let shutdown = watcher.add_handler(monitor).get_shutdown_channel();

    std::thread::spawn(move || {
        watcher.start_watch();
    });

    shutdown
}
