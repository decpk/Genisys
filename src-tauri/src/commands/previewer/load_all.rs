use crate::commands::AppState;
use crate::database::{load_previewer_folders_db, load_previewer_previews_db};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_previewer_load_all(state: State<'_, AppState>) -> Value {
    let folders = load_previewer_folders_db(&state.db);
    let previews = load_previewer_previews_db(&state.db);
    serde_json::json!({ "success": true, "folders": folders, "previews": previews })
}
