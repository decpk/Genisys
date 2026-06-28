use tauri::State;

use crate::commands::AppState;
use crate::database::load_tool_calls_db;
use crate::types::ToolCallRecord;

#[tauri::command]
pub fn cmd_load_tool_calls(
    state: State<'_, AppState>,
    conversation_id: String,
) -> Vec<ToolCallRecord> {
    let result = load_tool_calls_db(&state.db, &conversation_id);
    println!(
        "[db-debug] cmd_load_tool_calls => {} tool calls for {}",
        result.len(),
        conversation_id
    );
    result
}
