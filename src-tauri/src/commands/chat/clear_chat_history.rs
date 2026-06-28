use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_clear_chat_history(state: State<'_, AppState>) -> Value {
    state.db.conn().execute("DELETE FROM conversations", []).ok();
    serde_json::json!({"success": true})
}
