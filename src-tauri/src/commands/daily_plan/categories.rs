use crate::commands::AppState;
use crate::database::*;
use crate::types::*;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_category(state: State<'_, AppState>, category: DPCategory) -> Value {
    save_dp_category_db(&state.db, &category);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_load_categories(state: State<'_, AppState>) -> Vec<DPCategory> {
    load_dp_categories_db(&state.db)
}

#[tauri::command]
pub fn cmd_dp_remove_category(state: State<'_, AppState>, id: String) -> Value {
    remove_dp_category_db(&state.db, &id);
    serde_json::json!({"success": true})
}
