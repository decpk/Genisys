use tauri::State;

use crate::commands::AppState;
use crate::database::load_stocks_tile_db;
use crate::types::StocksTile;

#[tauri::command]
pub fn cmd_load_stocks_tile(state: State<'_, AppState>) -> Option<StocksTile> {
    load_stocks_tile_db(&state.db)
}
