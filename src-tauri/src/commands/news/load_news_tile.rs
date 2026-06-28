use crate::commands::AppState;
use crate::database::load_news_tile_db;
use crate::types::NewsTile;
use tauri::State;

#[tauri::command]
pub fn cmd_load_news_tile(state: State<'_, AppState>) -> Option<NewsTile> {
    let result = load_news_tile_db(&state.db);
    println!("[db-debug] cmd_load_news_tile => {:?}", result.is_some());
    result
}
