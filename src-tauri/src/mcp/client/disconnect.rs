use crate::mcp::client::connect::McpClient;

/// Cleanly disconnect from an MCP server by killing the transport process.
pub async fn disconnect(client: &McpClient) {
    println!("[MCP] Disconnecting from server '{}'...", client.config.name);
    client.transport.shutdown().await;
    println!("[MCP] Server '{}' disconnected", client.config.name);
}
