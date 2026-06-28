use serde_json::Value;
use tauri::{Emitter, State};

use crate::mcp::config;
use crate::mcp::McpManager;

#[tauri::command]
pub async fn cmd_mcp_disconnect_server(
    app: tauri::AppHandle,
    mcp: State<'_, McpManager>,
    name: String,
) -> Result<Value, String> {
    mcp.disconnect_server(&name).await;
    let configs = config::load_configs();
    let summaries = mcp.get_server_summaries(&configs).await;
    let _ = app.emit("mcp-status-changed", &summaries);
    Ok(serde_json::to_value(&summaries).unwrap_or_default())
}
