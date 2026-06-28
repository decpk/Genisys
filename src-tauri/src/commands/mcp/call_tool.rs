use serde_json::Value;
use tauri::State;

use crate::mcp::McpManager;

/// Execute a single tool on a connected MCP server from the frontend.
///
/// `server` is the MCP server name (e.g. "github") and `tool` is the bare tool
/// name (e.g. "ask"). They are combined into the namespaced
/// "mcp__{server}__{tool}" form that `McpManager::execute_tool` expects.
/// Returns the tool's text result, or an error string if the server is not
/// connected or the call fails.
#[tauri::command]
pub async fn cmd_mcp_call_tool(
    mcp: State<'_, McpManager>,
    server: String,
    tool: String,
    args: Value,
) -> Result<String, String> {
    let prefixed = format!("mcp__{}__{}", server, tool);
    mcp.execute_tool(&prefixed, args).await
}
