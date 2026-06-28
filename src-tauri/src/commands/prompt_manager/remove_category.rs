use crate::commands::AppState;
use crate::database::remove_pm_category_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_remove_category(state: State<'_, AppState>, category_id: String) -> Value {
    remove_pm_category_db(&state.db, &category_id);
    serde_json::json!({"success": true})
}
