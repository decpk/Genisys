use crate::commands::AppState;
use crate::database::load_snippets_db;
use crate::types::Snippet;
use tauri::State;

#[tauri::command]
pub fn cmd_load_snippets(state: State<'_, AppState>) -> Vec<Snippet> {
    let result = load_snippets_db(&state.db);
    println!("[db-debug] cmd_load_snippets => {} snippets", result.len());
    result
}
