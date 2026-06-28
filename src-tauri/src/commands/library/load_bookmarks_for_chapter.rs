use crate::commands::AppState;
use crate::database::load_bookmarks_for_chapter_db;
use crate::types::BookmarkWithContext;
use tauri::State;

#[tauri::command]
pub fn cmd_load_bookmarks_for_chapter(
    state: State<'_, AppState>,
    chapter_id: String,
) -> Vec<BookmarkWithContext> {
    load_bookmarks_for_chapter_db(&state.db, &chapter_id)
}
