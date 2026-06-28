use tauri::State;

use crate::commands::AppState;
use crate::database::save_tool_calls_db;
use crate::types::ToolCallRecord;

#[tauri::command]
pub fn cmd_save_tool_calls(
    state: State<'_, AppState>,
    tool_calls: Vec<ToolCallRecord>,
) -> serde_json::Value {
    match save_tool_calls_db(&state.db, &tool_calls) {
        Ok(()) => serde_json::json!({"success": true}),
        Err(e) => {
            eprintln!("[db] cmd_save_tool_calls FAILED: {e}");
            serde_json::json!({"success": false, "error": e})
        }
    }
}
