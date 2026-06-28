use serde_json::Value;
use tauri::{Emitter, State};

use crate::mcp::config;
use crate::mcp::McpManager;

#[tauri::command]
pub async fn cmd_mcp_connect_server(
    app: tauri::AppHandle,
    mcp: State<'_, McpManager>,
    name: String,
) -> Result<Value, String> {
    let configs = config::load_configs();
    let server_config = configs
        .iter()
        .find(|c| c.name == name)
        .ok_or_else(|| format!("Server '{}' not found in config", name))?;

    mcp.connect_server(server_config).await?;

    let summaries = mcp.get_server_summaries(&configs).await;
    let _ = app.emit("mcp-status-changed", &summaries);
    Ok(serde_json::to_value(&summaries).unwrap_or_default())
}
