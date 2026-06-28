use crate::mcp::types::JsonRpcResponse;

/// Parse a JSON-RPC 2.0 response from a raw JSON string.
/// Returns an error string if parsing fails.
pub fn parse_response(raw: &str) -> Result<JsonRpcResponse, String> {
    serde_json::from_str::<JsonRpcResponse>(raw)
        .map_err(|e| format!("Failed to parse JSON-RPC response: {e}"))
}
