use serde_json::Value;
use tauri::State;

use crate::mcp::McpManager;

#[tauri::command]
pub async fn cmd_mcp_list_tools(
    mcp: State<'_, McpManager>,
) -> Result<Value, String> {
    let tools = mcp.get_all_tool_definitions().await;
    Ok(serde_json::json!({
        "tools": tools,
        "count": tools.len(),
    }))
}
