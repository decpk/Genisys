use crate::commands::AppState;
use crate::database::load_news_interests_db;
use crate::types::NewsInterest;
use tauri::State;

#[tauri::command]
pub fn cmd_load_news_interests(state: State<'_, AppState>, tile_id: String) -> Vec<NewsInterest> {
    let result = load_news_interests_db(&state.db, &tile_id);
    println!("[db-debug] cmd_load_news_interests => {} items", result.len());
    result
}
