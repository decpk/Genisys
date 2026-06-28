use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_chat_conversation(state: State<'_, AppState>, conversation_id: String) -> Value {
    state.db.conn().execute("DELETE FROM conversations WHERE id=?1", rusqlite::params![conversation_id]).ok();
    serde_json::json!({"success": true})
}
