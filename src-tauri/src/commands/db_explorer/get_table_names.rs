use crate::commands::AppState;
use crate::database::get_table_names_db;
use tauri::State;

#[tauri::command]
pub fn cmd_get_table_names(state: State<'_, AppState>) -> Vec<String> {
    let tables = get_table_names_db(&state.db);
    println!("[db-explorer] get_table_names => {} tables", tables.len());
    tables
}
