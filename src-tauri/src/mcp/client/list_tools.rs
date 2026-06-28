use std::sync::atomic::Ordering;

use crate::mcp::client::connect::McpClient;
use crate::mcp::jsonrpc::build_request;
use crate::mcp::types::McpToolDefinition;

/// Refresh the list of tools from the MCP server.
/// Returns the updated tools list.
pub async fn list_tools(client: &McpClient) -> Result<Vec<McpToolDefinition>, String> {
    let id = client.request_id.fetch_add(1, Ordering::SeqCst);
    let request = build_request(id, "tools/list", None);
    let response = client.transport.send_request(&request).await?;

    if let Some(err) = response.error {
        return Err(format!("tools/list error: {} (code {})", err.message, err.code));
    }

    let result = response.result.ok_or("Missing tools/list result")?;
    let tools_arr = result["tools"].as_array().cloned().unwrap_or_default();

    let tools: Vec<McpToolDefinition> = tools_arr
        .into_iter()
        .filter_map(|v| serde_json::from_value::<McpToolDefinition>(v).ok())
        .collect();

    Ok(tools)
}
