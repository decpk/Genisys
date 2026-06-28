use crate::commands::AppState;
use crate::database::save_chat_conversation_db;
use crate::types::ChatConversation;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_chat_conversation(state: State<'_, AppState>, conversation: ChatConversation) -> Value {
    save_chat_conversation_db(&state.db, &conversation); serde_json::json!({"success": true})
}
