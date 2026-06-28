use crate::commands::AppState;
use crate::database::load_book_with_chapters_db;
use crate::types::BookWithChapters;
use tauri::State;

#[tauri::command]
pub fn cmd_load_book_with_chapters(
    state: State<'_, AppState>,
    book_id: String,
) -> Option<BookWithChapters> {
    load_book_with_chapters_db(&state.db, &book_id)
}
