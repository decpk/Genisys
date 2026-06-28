use crate::commands::AppState;
use crate::database::count_clipboard_items_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_clipboard_stats(
    state: State<'_, AppState>,
) -> Value {
    let (total, text_count, image_count, labeled_count, pinned_count) = count_clipboard_items_db(&state.db);
    serde_json::json!({
        "total": total,
        "textCount": text_count,
        "imageCount": image_count,
        "labeledCount": labeled_count,
        "pinnedCount": pinned_count
    })
}
