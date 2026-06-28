use crate::commands::AppState;
use crate::database::{save_news_articles_db, toggle_news_article_liked_db, delete_news_articles_for_interest_db};
use crate::types::NewsArticle;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_news_articles(state: State<'_, AppState>, interest_id: String, articles: Vec<NewsArticle>) -> Value {
    save_news_articles_db(&state.db, &interest_id, &articles);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_toggle_news_article_liked(state: State<'_, AppState>, article_id: String, liked: bool) -> Value {
    toggle_news_article_liked_db(&state.db, &article_id, liked);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_delete_news_articles_for_interest(state: State<'_, AppState>, interest_id: String) -> Value {
    delete_news_articles_for_interest_db(&state.db, &interest_id);
    serde_json::json!({"success": true})
}
