use std::sync::Arc;
use tauri::State;
use crate::database::{prune_clipboard_items_db, Database};
use super::monitor::ClipboardMonitorControl;

#[tauri::command]
pub fn cmd_set_clipboard_max_items(
    max_items: i64,
    control: State<'_, Arc<ClipboardMonitorControl>>,
    db: State<'_, Arc<Database>>,
) -> serde_json::Value {
    let clamped = max_items.clamp(50, 10000);
    control.set_max_items(clamped);

    // Immediately prune to apply the new limit
    let images_dir = std::env::var("HOME")
        .map(|h| std::path::PathBuf::from(h).join(".genisys").join("clipboard-images"))
        .unwrap_or_default();
    let pruned = prune_clipboard_items_db(&db, clamped);
    for (img, thumb) in &pruned {
        if let Some(p) = img {
            let _ = std::fs::remove_file(images_dir.join(p));
        }
        if let Some(p) = thumb {
            let _ = std::fs::remove_file(images_dir.join(p));
        }
    }

    serde_json::json!({ "success": true, "maxItems": clamped, "pruned": pruned.len() })
}
