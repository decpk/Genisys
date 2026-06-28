use crate::commands::AppState;
use crate::database::load_timer_tags_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_timer_tags(state: State<'_, AppState>) -> Value {
    let items = load_timer_tags_db(&state.db);
    serde_json::json!({ "items": items })
}
