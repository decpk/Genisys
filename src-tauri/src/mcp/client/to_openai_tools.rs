use serde_json::Value;

use crate::mcp::types::McpToolDefinition;

/// Convert an MCP tool definition to OpenAI-compatible function tool format.
/// Prefixes the tool name with the server name to avoid collisions.
pub fn to_openai_tool(server_name: &str, tool: &McpToolDefinition) -> Value {
    let prefixed_name = format!("mcp__{}__{}", server_name, tool.name);

    let description = tool.description.as_deref().unwrap_or("").to_string();

    serde_json::json!({
        "type": "function",
        "function": {
            "name": prefixed_name,
            "description": description,
            "parameters": tool.input_schema,
        }
    })
}

/// Convert a list of MCP tool definitions to OpenAI-compatible tool definitions.
pub fn to_openai_tools(server_name: &str, tools: &[McpToolDefinition]) -> Vec<Value> {
    tools
        .iter()
        .map(|t| to_openai_tool(server_name, t))
        .collect()
}

/// Parse an MCP-prefixed tool name (e.g., "mcp__github__search_repos")
/// into (server_name, tool_name). Returns None if not an MCP tool.
pub fn parse_mcp_tool_name(prefixed: &str) -> Option<(String, String)> {
    if !prefixed.starts_with("mcp__") {
        return None;
    }
    let rest = &prefixed[5..]; // Strip "mcp__"
    let parts: Vec<&str> = rest.splitn(2, "__").collect();
    if parts.len() == 2 {
        Some((parts[0].to_string(), parts[1].to_string()))
    } else {
        None
    }
}
