use serde_json::Value;
use tauri::State;

use crate::mcp::config;
use crate::mcp::McpManager;

#[tauri::command]
pub async fn cmd_mcp_remove_server(
    mcp: State<'_, McpManager>,
    name: String,
) -> Result<Value, String> {
    mcp.disconnect_server(&name).await;
    let configs = config::remove_config(&name)?;
    let summaries = mcp.get_server_summaries(&configs).await;
    Ok(serde_json::to_value(&summaries).unwrap_or_default())
}
