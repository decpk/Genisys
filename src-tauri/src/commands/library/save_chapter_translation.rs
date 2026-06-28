use crate::commands::AppState;
use crate::database::save_chapter_translation_db;
use crate::types::ChapterTranslation;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_chapter_translation(
    state: State<'_, AppState>,
    translation: ChapterTranslation,
) -> Value {
    save_chapter_translation_db(&state.db, &translation);
    serde_json::json!({"success": true})
}
