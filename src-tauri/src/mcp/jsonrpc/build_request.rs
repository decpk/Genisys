use serde_json::Value;
use crate::mcp::types::JsonRpcRequest;

/// Build a JSON-RPC 2.0 request with the given method and params.
pub fn build_request(id: u64, method: &str, params: Option<Value>) -> JsonRpcRequest {
    JsonRpcRequest {
        jsonrpc: "2.0".to_string(),
        id,
        method: method.to_string(),
        params,
    }
}
