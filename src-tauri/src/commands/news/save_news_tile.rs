use crate::commands::AppState;
use crate::database::save_news_tile_db;
use crate::types::NewsTile;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_news_tile(state: State<'_, AppState>, tile: Option<NewsTile>) -> Value {
    save_news_tile_db(&state.db, tile.as_ref());
    serde_json::json!({"success": true})
}
