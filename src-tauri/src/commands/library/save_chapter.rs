use crate::commands::AppState;
use crate::database::save_chapter_db;
use crate::types::Chapter;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_chapter(state: State<'_, AppState>, chapter: Chapter) -> Value {
    save_chapter_db(&state.db, &chapter);
    serde_json::json!({"success": true})
}
