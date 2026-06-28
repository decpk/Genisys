use crate::commands::AppState;
use crate::database::load_chapter_translations_db;
use crate::types::ChapterTranslation;
use tauri::State;

#[tauri::command]
pub fn cmd_load_chapter_translations(
    state: State<'_, AppState>,
    chapter_id: String,
) -> Vec<ChapterTranslation> {
    load_chapter_translations_db(&state.db, &chapter_id)
}
