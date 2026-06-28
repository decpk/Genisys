use crate::commands::AppState;
use crate::database::load_chapter_content_db;
use tauri::State;

#[tauri::command]
pub fn cmd_load_chapter_content(
    state: State<'_, AppState>,
    chapter_id: String,
) -> Option<String> {
    load_chapter_content_db(&state.db, &chapter_id)
}
