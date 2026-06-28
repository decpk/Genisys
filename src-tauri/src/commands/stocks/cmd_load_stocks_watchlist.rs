use tauri::State;

use crate::commands::AppState;
use crate::database::load_stocks_watchlist_db;
use crate::types::StockWatchItem;

#[tauri::command]
pub fn cmd_load_stocks_watchlist(state: State<'_, AppState>, tile_id: String) -> Vec<StockWatchItem> {
    load_stocks_watchlist_db(&state.db, &tile_id)
}
