use serde_json::Value;
use tauri::State;

use crate::commands::AppState;
use crate::database::save_stocks_watchlist_db;
use crate::types::StockWatchItem;

#[tauri::command]
pub fn cmd_save_stocks_watchlist(
    state: State<'_, AppState>,
    tile_id: String,
    items: Vec<StockWatchItem>,
) -> Value {
    save_stocks_watchlist_db(&state.db, &tile_id, &items);
    serde_json::json!({ "success": true })
}
