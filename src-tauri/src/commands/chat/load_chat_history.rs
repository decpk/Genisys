use crate::commands::AppState;
use crate::database::load_chat_history_db;
use crate::types::ChatConversation;
use tauri::State;

#[tauri::command]
pub fn cmd_load_chat_history(state: State<'_, AppState>) -> Vec<ChatConversation> {
    let result = load_chat_history_db(&state.db);
    println!("[db-debug] cmd_load_chat_history => {} conversations", result.len());
    result
}
