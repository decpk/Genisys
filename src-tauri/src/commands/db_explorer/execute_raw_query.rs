use crate::commands::AppState;
use crate::database::execute_raw_query_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_execute_raw_query(
    state: State<'_, AppState>,
    query: String,
    is_write: bool,
) -> Value {
    println!("[db-explorer] execute_raw_query (write={is_write}): {query}");
    execute_raw_query_db(&state.db, &query, is_write)
}
