use tauri::State;

use crate::commands::AppState;
use crate::database::load_tool_calls_by_message_db;
use crate::types::ToolCallRecord;

#[tauri::command]
pub fn cmd_load_tool_calls_by_message(
    state: State<'_, AppState>,
    message_id: String,
) -> Vec<ToolCallRecord> {
    let result = load_tool_calls_by_message_db(&state.db, &message_id);
    println!(
        "[db-debug] cmd_load_tool_calls_by_message => {} tool calls for message {}",
        result.len(),
        message_id
    );
    result
}
