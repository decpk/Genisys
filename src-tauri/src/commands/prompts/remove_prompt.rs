use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_prompt(state: State<'_, AppState>, prompt_id: String) -> Value {
    state.db.conn().execute("DELETE FROM prompts WHERE id=?1", rusqlite::params![prompt_id]).ok();
    serde_json::json!({"success": true})
}
