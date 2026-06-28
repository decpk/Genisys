use crate::commands::AppState;
use crate::database::remove_chapter_translation_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_chapter_translation(
    state: State<'_, AppState>,
    chapter_id: String,
    language: String,
) -> Value {
    remove_chapter_translation_db(&state.db, &chapter_id, &language);
    serde_json::json!({"success": true})
}
