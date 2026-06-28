use serde::Serialize;
use std::collections::HashMap;

use crate::mcp::types::McpTransportType;

/// Discovered MCP server from VS Code configs
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoveredMcpServer {
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub env: HashMap<String, String>,
    pub transport: McpTransportType,
    pub source: String, // e.g. "yammer-dev/.vscode/mcp.json"
}
