use serde_json::Value;
use std::collections::HashMap;
use tokio::sync::Mutex;

use crate::mcp::client::{self, McpClient};
use crate::mcp::types::{McpConnectionStatus, McpServerConfig, McpServerSummary};

/// Manages multiple MCP server connections.
pub struct McpManager {
    clients: Mutex<HashMap<String, McpClient>>,
    errors: Mutex<HashMap<String, String>>,
}

impl McpManager {
    pub fn new() -> Self {
        Self {
            clients: Mutex::new(HashMap::new()),
            errors: Mutex::new(HashMap::new()),
        }
    }

    /// Connect to a single MCP server. If already connected, disconnects first.
    pub async fn connect_server(&self, config: &McpServerConfig) -> Result<(), String> {
        // Disconnect existing connection if any
        self.disconnect_server(&config.name).await;

        // Clear previous error
        {
            let mut errors = self.errors.lock().await;
            errors.remove(&config.name);
        }

        match client::connect::connect(config).await {
            Ok(mcp_client) => {
                let mut clients = self.clients.lock().await;
                clients.insert(config.name.clone(), mcp_client);
                Ok(())
            }
            Err(e) => {
                let mut errors = self.errors.lock().await;
                errors.insert(config.name.clone(), e.clone());
                Err(e)
            }
        }
    }

    /// Disconnect from a specific MCP server.
    pub async fn disconnect_server(&self, name: &str) {
        let mut clients = self.clients.lock().await;
        if let Some(c) = clients.remove(name) {
            client::disconnect(&c).await;
        }
    }

    /// Disconnect from all MCP servers.
    pub async fn disconnect_all(&self) {
        let mut clients = self.clients.lock().await;
        for (_, c) in clients.drain() {
            client::disconnect(&c).await;
        }
    }

    /// Get OpenAI-compatible tool definitions from all connected servers.
    pub async fn get_all_tool_definitions(&self) -> Vec<Value> {
        let clients = self.clients.lock().await;
        let mut defs = Vec::new();
        for (_, c) in clients.iter() {
            defs.extend(client::to_openai_tools(&c.config.name, &c.tools));
        }
        defs
    }

    /// Check if a tool name belongs to an MCP server.
    pub fn is_mcp_tool(tool_name: &str) -> bool {
        client::parse_mcp_tool_name(tool_name).is_some()
    }

    /// Execute an MCP tool call. The tool_name should be in "mcp__server__tool" format.
    pub async fn execute_tool(&self, tool_name: &str, args: Value) -> Result<String, String> {
        let (server_name, actual_tool_name) =
            client::parse_mcp_tool_name(tool_name).ok_or_else(|| {
                format!("'{}' is not an MCP tool name", tool_name)
            })?;

        let clients = self.clients.lock().await;
        let mcp_client = clients.get(&server_name).ok_or_else(|| {
            format!("MCP server '{}' is not connected", server_name)
        })?;

        client::call_tool(mcp_client, &actual_tool_name, args).await
    }

    /// Get summaries of all configured/connected servers for frontend display.
    pub async fn get_server_summaries(&self, configs: &[McpServerConfig]) -> Vec<McpServerSummary> {
        let clients = self.clients.lock().await;
        let errors = self.errors.lock().await;

        configs
            .iter()
            .map(|config| {
                if let Some(c) = clients.get(&config.name) {
                    McpServerSummary {
                        name: config.name.clone(),
                        status: McpConnectionStatus::Connected,
                        server_info: Some(c.server_info.server_info.clone()),
                        tool_count: c.tools.len(),
                        error: None,
                    }
                } else if let Some(err) = errors.get(&config.name) {
                    McpServerSummary {
                        name: config.name.clone(),
                        status: McpConnectionStatus::Error,
                        server_info: None,
                        tool_count: 0,
                        error: Some(err.clone()),
                    }
                } else {
                    McpServerSummary {
                        name: config.name.clone(),
                        status: McpConnectionStatus::Disconnected,
                        server_info: None,
                        tool_count: 0,
                        error: None,
                    }
                }
            })
            .collect()
    }

    /// Refresh tools for a specific connected server.
    pub async fn refresh_tools(&self, server_name: &str) -> Result<usize, String> {
        let mut clients = self.clients.lock().await;
        let mcp_client = clients.get_mut(server_name).ok_or_else(|| {
            format!("MCP server '{}' is not connected", server_name)
        })?;

        let new_tools = client::list_tools(mcp_client).await?;
        let count = new_tools.len();
        mcp_client.tools = new_tools;

        println!("[MCP] Refreshed tools for '{}': {} tools", server_name, count);
        Ok(count)
    }
}
