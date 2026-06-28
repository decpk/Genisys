use crate::commands::AppState;
use crate::database::load_timer_milestones_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_timer_milestones(state: State<'_, AppState>) -> Value {
    let items = load_timer_milestones_db(&state.db);
    serde_json::json!({ "items": items })
}
