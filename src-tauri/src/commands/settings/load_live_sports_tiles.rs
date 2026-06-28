use crate::commands::AppState;
use crate::database::load_live_sports_tiles_db;
use crate::types::LiveSportTile;
use tauri::State;

#[tauri::command]
pub fn cmd_load_live_sports_tiles(state: State<'_, AppState>) -> Vec<LiveSportTile> {
    let result = load_live_sports_tiles_db(&state.db);
    println!("[db-debug] cmd_load_live_sports_tiles => {} items", result.len());
    result
}
