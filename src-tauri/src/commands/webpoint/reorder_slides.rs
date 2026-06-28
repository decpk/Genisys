use crate::commands::AppState;
use crate::database::reorder_slides_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_reorder_slides(
    state: State<'_, AppState>,
    presentation_id: String,
    slide_ids: Vec<String>,
) -> Value {
    reorder_slides_db(&state.db, &presentation_id, &slide_ids);
    serde_json::json!({"success": true})
}
