use crate::commands::AppState;
use crate::database::load_explorer_history_db;
use crate::types::ExplorerHistoryPage;
use tauri::State;

#[tauri::command]
pub fn cmd_load_explorer_history(state: State<'_, AppState>, before_cursor: Option<String>) -> ExplorerHistoryPage {
    let result = load_explorer_history_db(&state.db, before_cursor.as_deref());
    println!("[db-debug] cmd_load_explorer_history => {} entries, has_more={}", result.items.len(), result.has_more);
    result
}
