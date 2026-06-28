use tauri::State;

use crate::commands::AppState;
use crate::database::load_tool_call_summaries_db;
use crate::types::ToolCallSummary;

#[tauri::command]
pub fn cmd_load_tool_call_summaries(
    state: State<'_, AppState>,
    conversation_id: String,
) -> Vec<ToolCallSummary> {
    let result = load_tool_call_summaries_db(&state.db, &conversation_id);
    println!(
        "[db-debug] cmd_load_tool_call_summaries => {} summaries for {}",
        result.len(),
        conversation_id
    );
    result
}
