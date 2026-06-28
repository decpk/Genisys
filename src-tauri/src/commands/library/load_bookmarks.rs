use crate::commands::AppState;
use crate::database::load_bookmarks_db;
use crate::types::BookmarkWithContext;
use tauri::State;

#[tauri::command]
pub fn cmd_load_bookmarks(state: State<'_, AppState>) -> Vec<BookmarkWithContext> {
    load_bookmarks_db(&state.db)
}
