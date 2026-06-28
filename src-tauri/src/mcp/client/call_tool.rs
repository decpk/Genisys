use serde_json::Value;
use std::sync::atomic::Ordering;

use crate::mcp::client::connect::McpClient;
use crate::mcp::jsonrpc::build_request;
use crate::mcp::types::{McpToolCallParams, McpToolCallResult};

/// Call a tool on the MCP server and return the result as a text string.
pub async fn call_tool(client: &McpClient, tool_name: &str, arguments: Value) -> Result<String, String> {
    let id = client.request_id.fetch_add(1, Ordering::SeqCst);

    let params = McpToolCallParams {
        name: tool_name.to_string(),
        arguments,
    };

    let request = build_request(
        id,
        "tools/call",
        Some(serde_json::to_value(&params).map_err(|e| format!("Serialize error: {e}"))?),
    );

    let response = client.transport.send_request(&request).await?;

    if let Some(err) = response.error {
        return Err(format!("Tool call error: {} (code {})", err.message, err.code));
    }

    let result: McpToolCallResult = serde_json::from_value(
        response.result.ok_or("Missing tool call result")?,
    )
    .map_err(|e| format!("Failed to parse tool call result: {e}"))?;

    if result.is_error {
        let error_text = extract_text_content(&result);
        return Err(format!("Tool '{}' returned error: {}", tool_name, error_text));
    }

    Ok(extract_text_content(&result))
}

/// Extract all text content from a tool call result, joining multiple content items.
fn extract_text_content(result: &McpToolCallResult) -> String {
    result
        .content
        .iter()
        .filter_map(|c| {
            if c.content_type == "text" {
                c.text.clone()
            } else {
                // For non-text content (e.g., images), include a placeholder
                Some(format!("[{} content]", c.content_type))
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}
