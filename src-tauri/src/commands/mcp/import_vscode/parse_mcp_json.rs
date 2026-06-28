use serde_json::Value;
use std::collections::HashMap;

use crate::mcp::types::McpTransportType;

use super::types::DiscoveredMcpServer;

/// Parse a VS Code mcp.json structure into DiscoveredMcpServer entries.
pub fn parse_mcp_json(value: &Value, source: &str, results: &mut Vec<DiscoveredMcpServer>) {
    let servers = match value.get("servers").and_then(|s| s.as_object()) {
        Some(s) => s,
        None => return,
    };

    for (name, config) in servers {
        let transport = match config.get("type").and_then(|t| t.as_str()) {
            Some("http") => McpTransportType::Http,
            _ => McpTransportType::Stdio,
        };

        let command = config
            .get("command")
            .and_then(|c| c.as_str())
            .unwrap_or("")
            .to_string();

        let args: Vec<String> = config
            .get("args")
            .and_then(|a| a.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect()
            })
            .unwrap_or_default();

        let env: HashMap<String, String> = config
            .get("env")
            .and_then(|e| e.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|val| (k.clone(), val.to_string())))
                    .collect()
            })
            .unwrap_or_default();

        // Skip servers with no command (http-only servers without command)
        if command.is_empty() && transport == McpTransportType::Stdio {
            continue;
        }

        results.push(DiscoveredMcpServer {
            name: name.clone(),
            command,
            args,
            env,
            transport,
            source: source.to_string(),
        });
    }
}
