use crate::commands::AppState;
use crate::database::{load_news_articles_db, load_liked_news_articles_db};
use crate::types::NewsArticle;
use tauri::State;

#[tauri::command]
pub fn cmd_load_news_articles(state: State<'_, AppState>, interest_id: String) -> Vec<NewsArticle> {
    load_news_articles_db(&state.db, &interest_id)
}

#[tauri::command]
pub fn cmd_load_liked_news_articles(state: State<'_, AppState>, tile_id: String) -> Vec<NewsArticle> {
    load_liked_news_articles_db(&state.db, &tile_id)
}
