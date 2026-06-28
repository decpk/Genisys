use crate::commands::AppState;
use crate::database::append_chat_message_db;
use crate::types::ChatMessage;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_append_chat_message(
    state: State<'_, AppState>,
    conversation_id: String,
    title: String,
    created_at: String,
    updated_at: String,
    message: ChatMessage,
) -> Value {
    let fn_start = std::time::Instant::now();
    println!("[ChatFlow] Tauri IPC (window.api.appendChatMessage) → cmd_append_chat_message() [{}]", message.role);
    println!("[ChatFlow] cmd_append_chat_message() → append_chat_message_db()");
    let result = append_chat_message_db(&state.db, &conversation_id, &title, &created_at, &updated_at, &message);
    let fn_elapsed = fn_start.elapsed();
    println!("[ChatFlow] cmd_append_chat_message() [{}] | start: 0ms | end: {:.2}ms | diff: {:.2}ms", message.role, fn_elapsed.as_secs_f64() * 1000.0, fn_elapsed.as_secs_f64() * 1000.0);
    match result {
        Ok(()) => serde_json::json!({"success": true}),
        Err(e) => {
            eprintln!("[ChatFlow] cmd_append_chat_message() FAILED: {e}");
            serde_json::json!({"success": false, "error": e})
        }
    }
}
