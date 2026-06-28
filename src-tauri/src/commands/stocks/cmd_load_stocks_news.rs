use tauri::State;

use crate::commands::AppState;
use crate::database::load_stocks_news_db;
use crate::types::StockNewsItem;

#[tauri::command]
pub fn cmd_load_stocks_news(state: State<'_, AppState>, watchlist_id: String) -> Vec<StockNewsItem> {
    load_stocks_news_db(&state.db, &watchlist_id)
}
