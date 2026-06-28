use serde_json::Value;
use tauri::State;

use crate::commands::AppState;
use crate::database::save_stocks_news_db;
use crate::types::StockNewsItem;

#[tauri::command]
pub fn cmd_save_stocks_news(
    state: State<'_, AppState>,
    watchlist_id: String,
    items: Vec<StockNewsItem>,
) -> Value {
    save_stocks_news_db(&state.db, &watchlist_id, &items);
    serde_json::json!({ "success": true })
}
