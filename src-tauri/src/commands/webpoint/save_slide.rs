use crate::commands::AppState;
use crate::database::save_slide_db;
use crate::types::Slide;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_slide(state: State<'_, AppState>, slide: Slide) -> Value {
    save_slide_db(&state.db, &slide);
    serde_json::json!({"success": true})
}
