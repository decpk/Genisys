use serde_json::Value;
use tauri::State;

use crate::commands::AppState;
use crate::database::save_stocks_tile_db;
use crate::types::StocksTile;

#[tauri::command]
pub fn cmd_save_stocks_tile(state: State<'_, AppState>, tile: Option<StocksTile>) -> Value {
    save_stocks_tile_db(&state.db, tile.as_ref());
    serde_json::json!({ "success": true })
}
