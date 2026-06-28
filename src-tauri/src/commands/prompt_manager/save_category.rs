use crate::commands::AppState;
use crate::database::save_pm_category_db;
use crate::types::PmCategory;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_pm_save_category(state: State<'_, AppState>, category: PmCategory) -> Value {
    save_pm_category_db(&state.db, &category);
    serde_json::json!({"success": true})
}
