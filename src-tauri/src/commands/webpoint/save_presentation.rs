use crate::commands::AppState;
use crate::database::save_presentation_db;
use crate::types::PresentationMeta;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_presentation(state: State<'_, AppState>, presentation: PresentationMeta) -> Value {
    save_presentation_db(&state.db, &presentation);
    serde_json::json!({"success": true})
}
