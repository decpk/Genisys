use crate::commands::AppState;
use crate::commands::library::image_cache::remove_book_dir;
use crate::database::remove_book_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_book(state: State<'_, AppState>, book_id: String) -> Value {
    remove_book_db(&state.db, &book_id);
    // Also wipe any cached images on disk so the user doesn't pay disk-space
    // for a book they just deleted.
    remove_book_dir(&book_id);
    serde_json::json!({"success": true})
}
