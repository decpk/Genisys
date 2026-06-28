use std::sync::atomic::AtomicU64;

use crate::mcp::jsonrpc::build_request;
use crate::mcp::transport::StdioTransport;
use crate::mcp::types::{
    McpClientCapabilities, McpClientInfo, McpInitializeParams, McpInitializeResult,
    McpServerConfig, McpToolDefinition, MCP_CLIENT_NAME, MCP_CLIENT_VERSION,
    MCP_PROTOCOL_VERSION,
};

/// A connected MCP client with its transport and metadata.
pub struct McpClient {
    pub config: McpServerConfig,
    pub transport: StdioTransport,
    pub server_info: McpInitializeResult,
    pub tools: Vec<McpToolDefinition>,
    pub request_id: AtomicU64,
}

/// Connect to an MCP server using the given configuration.
/// Spawns the process, performs the initialize handshake, and discovers tools.
pub async fn connect(config: &McpServerConfig) -> Result<McpClient, String> {
    println!("[MCP] Connecting to server '{}'...", config.name);

    // 1. Spawn transport
    let transport = StdioTransport::spawn(&config.command, &config.args, &config.env)?;

    // 2. Send initialize request
    let init_params = McpInitializeParams {
        protocol_version: MCP_PROTOCOL_VERSION.to_string(),
        capabilities: McpClientCapabilities {},
        client_info: McpClientInfo {
            name: MCP_CLIENT_NAME.to_string(),
            version: MCP_CLIENT_VERSION.to_string(),
        },
    };

    let init_request = build_request(
        1,
        "initialize",
        Some(serde_json::to_value(&init_params).map_err(|e| format!("Serialize error: {e}"))?),
    );

    let init_response = transport.send_request(&init_request).await?;

    if let Some(err) = init_response.error {
        return Err(format!(
            "MCP initialize error: {} (code {})",
            err.message, err.code
        ));
    }

    let init_result: McpInitializeResult = serde_json::from_value(
        init_response.result.ok_or("Missing initialize result")?,
    )
    .map_err(|e| format!("Failed to parse initialize result: {e}"))?;

    println!(
        "[MCP] Server '{}' initialized: {} v{}",
        config.name,
        init_result.server_info.name,
        init_result.server_info.version.as_deref().unwrap_or("?")
    );

    // 3. Send initialized notification
    transport.send_notification("notifications/initialized").await?;

    // 4. Discover tools
    let tools = if init_result.capabilities.tools.is_some() {
        let tools_request = build_request(2, "tools/list", None);
        let tools_response = transport.send_request(&tools_request).await?;

        if let Some(result) = tools_response.result {
            let tools_arr = result["tools"].as_array().cloned().unwrap_or_default();
            tools_arr
                .into_iter()
                .filter_map(|v| serde_json::from_value::<McpToolDefinition>(v).ok())
                .collect()
        } else {
            Vec::new()
        }
    } else {
        Vec::new()
    };

    println!(
        "[MCP] Server '{}' has {} tools available",
        config.name,
        tools.len()
    );

    Ok(McpClient {
        config: config.clone(),
        transport,
        server_info: init_result,
        tools,
        request_id: AtomicU64::new(10), // Start after init IDs
    })
}
