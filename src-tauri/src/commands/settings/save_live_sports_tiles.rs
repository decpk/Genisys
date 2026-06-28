use crate::commands::AppState;
use crate::database::save_live_sports_tiles_db;
use crate::types::LiveSportTile;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_live_sports_tiles(state: State<'_, AppState>, tiles: Vec<LiveSportTile>) -> Value {
    save_live_sports_tiles_db(&state.db, &tiles);
    serde_json::json!({"success": true})
}
