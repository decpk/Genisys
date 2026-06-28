use crate::commands::AppState;
use crate::database::load_conversation_messages_db;
use crate::types::ChatMessagesPage;
use tauri::State;

#[tauri::command]
pub fn cmd_load_conversation_messages(
    state: State<'_, AppState>,
    conversation_id: String,
    before_sort_order: Option<i64>,
    limit: i64,
) -> ChatMessagesPage {
    let result = load_conversation_messages_db(&state.db, &conversation_id, before_sort_order, limit);
    println!(
        "[db-debug] cmd_load_conversation_messages => {} msgs, has_more={}",
        result.messages.len(), result.has_more
    );
    result
}
