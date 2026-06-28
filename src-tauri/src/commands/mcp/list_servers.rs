use serde_json::Value;
use tauri::State;

use crate::mcp::config;
use crate::mcp::McpManager;

#[tauri::command]
pub async fn cmd_mcp_list_servers(
    mcp: State<'_, McpManager>,
) -> Result<Value, String> {
    let configs = config::load_configs();
    let summaries = mcp.get_server_summaries(&configs).await;
    Ok(serde_json::to_value(&summaries).unwrap_or_default())
}
