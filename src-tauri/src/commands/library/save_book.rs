use crate::commands::AppState;
use crate::database::save_book_db;
use crate::types::Book;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_book(state: State<'_, AppState>, book: Book) -> Value {
    save_book_db(&state.db, &book);
    serde_json::json!({"success": true})
}
