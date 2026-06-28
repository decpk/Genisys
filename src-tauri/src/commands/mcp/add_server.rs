use serde_json::Value;
use tauri::State;

use crate::mcp::config;
use crate::mcp::types::McpServerConfig;
use crate::mcp::McpManager;

#[tauri::command]
pub async fn cmd_mcp_add_server(
    mcp: State<'_, McpManager>,
    config_json: Value,
) -> Result<Value, String> {
    let server_config: McpServerConfig = serde_json::from_value(config_json)
        .map_err(|e| format!("Invalid server config: {e}"))?;

    let name = server_config.name.clone();
    let configs = config::upsert_config(server_config.clone())?;

    // Auto-connect if enabled
    if server_config.enabled {
        if let Err(e) = mcp.connect_server(&server_config).await {
            println!("[MCP] Failed to auto-connect '{}': {}", name, e);
        }
    }

    let summaries = mcp.get_server_summaries(&configs).await;
    Ok(serde_json::to_value(&summaries).unwrap_or_default())
}
