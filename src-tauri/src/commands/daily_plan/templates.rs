use crate::commands::AppState;
use crate::database::*;
use crate::types::*;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_template(state: State<'_, AppState>, template: DPTemplate) -> Value {
    save_dp_template_db(&state.db, &template);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_load_templates(state: State<'_, AppState>) -> Vec<DPTemplate> {
    load_dp_templates_db(&state.db)
}

#[tauri::command]
pub fn cmd_dp_remove_template(state: State<'_, AppState>, id: String) -> Value {
    remove_dp_template_db(&state.db, &id);
    serde_json::json!({"success": true})
}
