use crate::commands::AppState;
use crate::database::save_timer_tag_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_timer_tag(state: State<'_, AppState>, tag: Value) -> Value {
    match save_timer_tag_db(&state.db, &tag) {
        Ok(id) => serde_json::json!({ "success": true, "id": id }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
