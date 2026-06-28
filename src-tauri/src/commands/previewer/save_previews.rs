use crate::commands::AppState;
use crate::database::save_previewer_preview_db;
use crate::types::SavedPreview;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_previewer_save_previews(
    state: State<'_, AppState>,
    previews: Vec<SavedPreview>,
) -> Value {
    for preview in &previews {
        save_previewer_preview_db(&state.db, preview);
    }
    serde_json::json!({ "success": true, "count": previews.len() })
}
