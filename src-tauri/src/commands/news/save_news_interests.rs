use crate::commands::AppState;
use crate::database::save_news_interests_db;
use crate::types::NewsInterest;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_news_interests(state: State<'_, AppState>, tile_id: String, interests: Vec<NewsInterest>) -> Value {
    save_news_interests_db(&state.db, &tile_id, &interests);
    serde_json::json!({"success": true})
}
