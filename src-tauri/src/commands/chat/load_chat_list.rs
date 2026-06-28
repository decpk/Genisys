use crate::commands::AppState;
use crate::database::load_chat_list_db;
use crate::types::ChatConversationMeta;
use tauri::State;

#[tauri::command]
pub fn cmd_load_chat_list(state: State<'_, AppState>) -> Vec<ChatConversationMeta> {
    let result = load_chat_list_db(&state.db);
    println!("[db-debug] cmd_load_chat_list => {} conversations", result.len());
    result
}
