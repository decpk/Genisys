use crate::commands::AppState;
use crate::database::load_books_db;
use crate::types::BookMeta;
use tauri::State;

#[tauri::command]
pub fn cmd_load_books(state: State<'_, AppState>) -> Vec<BookMeta> {
    load_books_db(&state.db)
}
