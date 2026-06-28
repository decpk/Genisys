use serde::{Deserialize, Serialize};
use serde_json::Value;

// ── JSON-RPC 2.0 Base Types ────────────────────────────

/// A JSON-RPC 2.0 request message
#[derive(Debug, Serialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub id: u64,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
}

/// A JSON-RPC 2.0 response message
#[derive(Debug, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub id: Option<u64>,
    pub result: Option<Value>,
    pub error: Option<JsonRpcError>,
}

/// A JSON-RPC 2.0 error object
#[derive(Debug, Deserialize)]
pub struct JsonRpcError {
    pub code: i64,
    pub message: String,
    pub data: Option<Value>,
}

// ── MCP Initialization ─────────────────────────────────

/// Client info sent during initialization
#[derive(Debug, Serialize)]
pub struct McpClientInfo {
    pub name: String,
    pub version: String,
}

/// Capabilities the client supports
#[derive(Debug, Serialize)]
pub struct McpClientCapabilities {}

/// Initialize request params
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpInitializeParams {
    pub protocol_version: String,
    pub capabilities: McpClientCapabilities,
    pub client_info: McpClientInfo,
}

/// Server info received during initialization
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct McpServerInfo {
    pub name: String,
    #[serde(default)]
    pub version: Option<String>,
}

/// Server capabilities received during initialization
#[derive(Debug, Deserialize, Clone, Default)]
pub struct McpServerCapabilities {
    #[serde(default)]
    pub tools: Option<Value>,
    #[serde(default)]
    pub resources: Option<Value>,
    #[serde(default)]
    pub prompts: Option<Value>,
}

/// Initialize response result
#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct McpInitializeResult {
    pub protocol_version: String,
    pub capabilities: McpServerCapabilities,
    pub server_info: McpServerInfo,
}

// ── MCP Tools ───────────────────────────────────────────

/// A tool definition from an MCP server
#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct McpToolDefinition {
    pub name: String,
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub input_schema: Value,
}

/// Content item returned from a tool call
#[derive(Debug, Deserialize, Clone)]
pub struct McpToolContent {
    #[serde(rename = "type")]
    pub content_type: String,
    #[serde(default)]
    pub text: Option<String>,
    #[serde(default)]
    pub data: Option<String>,
    #[serde(default)]
    pub mime_type: Option<String>,
}

/// Result of a tools/call request
#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct McpToolCallResult {
    pub content: Vec<McpToolContent>,
    #[serde(default)]
    pub is_error: bool,
}

/// Params for a tools/call request
#[derive(Debug, Serialize)]
pub struct McpToolCallParams {
    pub name: String,
    pub arguments: Value,
}

// ── MCP Server Configuration ────────────────────────────

/// Transport type for MCP server connection
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum McpTransportType {
    Stdio,
    Http,
}

/// Configuration for an MCP server
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServerConfig {
    pub name: String,
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: std::collections::HashMap<String, String>,
    #[serde(default = "default_transport")]
    pub transport: McpTransportType,
    #[serde(default = "default_true")]
    pub enabled: bool,
}

fn default_transport() -> McpTransportType {
    McpTransportType::Stdio
}

fn default_true() -> bool {
    true
}

// ── MCP Connection Status ───────────────────────────────

/// Status of an MCP server connection
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum McpConnectionStatus {
    Disconnected,
    Connecting,
    Connected,
    Error,
}

/// Summary of a connected MCP server for frontend display
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServerSummary {
    pub name: String,
    pub status: McpConnectionStatus,
    pub server_info: Option<McpServerInfo>,
    pub tool_count: usize,
    pub error: Option<String>,
}

// ── MCP Protocol Constants ──────────────────────────────

/// MCP protocol version advertised in the `initialize` handshake.
///
/// Must be a current revision: some modern MCP servers reject the legacy
/// `2024-11-05` version — its `initialize`
/// hangs or fails with `-32603 Internal error: Missing content-type header`.
/// Servers negotiate down if they only support older revisions, and our client
/// does not require the echoed version to match, so sending the latest is safe.
pub const MCP_PROTOCOL_VERSION: &str = "2025-06-18";
pub const MCP_CLIENT_NAME: &str = "Genisys";
pub const MCP_CLIENT_VERSION: &str = "1.0.0";
