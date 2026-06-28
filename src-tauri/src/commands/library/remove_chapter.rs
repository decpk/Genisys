use crate::commands::AppState;
use crate::database::remove_chapter_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_chapter(
    state: State<'_, AppState>,
    chapter_id: String,
    book_id: String,
) -> Value {
    remove_chapter_db(&state.db, &chapter_id, &book_id);
    serde_json::json!({"success": true})
}
