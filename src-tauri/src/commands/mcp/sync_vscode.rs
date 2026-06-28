use serde::Serialize;
use tauri::State;

use crate::mcp::config;
use crate::mcp::types::McpServerConfig;
use crate::mcp::McpManager;

use super::import_vscode::cmd_mcp_import_vscode;

/// Result of the auto-sync operation.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpSyncResult {
    pub added: Vec<String>,
    pub skipped: Vec<String>,
    pub connected: usize,
    pub failed: usize,
}

/// Auto-sync MCP servers from VS Code on app startup.
/// 1. Discovers MCP servers from VS Code configs (project + global settings)
/// 2. Deduplicates against existing Genisys MCP servers by name
/// 3. Adds new servers to Genisys config (enabled by default)
/// 4. Auto-connects all enabled servers
#[tauri::command]
pub async fn cmd_mcp_sync_vscode(
    mcp: State<'_, McpManager>,
) -> Result<McpSyncResult, String> {
    // 1. Discover VS Code MCP servers
    let discovered = cmd_mcp_import_vscode().await?;

    // 2. Load existing Genisys configs
    let existing_configs = config::load_configs();
    let existing_names: std::collections::HashSet<String> =
        existing_configs.iter().map(|c| c.name.clone()).collect();

    // 3. Add new servers (skip duplicates)
    let mut added: Vec<String> = Vec::new();
    let mut skipped: Vec<String> = Vec::new();

    for server in &discovered {
        if existing_names.contains(&server.name) {
            skipped.push(server.name.clone());
            continue;
        }

        let config = McpServerConfig {
            name: server.name.clone(),
            command: server.command.clone(),
            args: server.args.clone(),
            env: server.env.clone(),
            transport: server.transport.clone(),
            enabled: true,
        };

        if let Err(e) = config::upsert_config(config) {
            println!("[MCP Sync] Failed to add '{}': {}", server.name, e);
            continue;
        }

        added.push(server.name.clone());
    }

    // 4. Connect all enabled servers
    let all_configs = config::load_configs();
    let enabled: Vec<_> = all_configs.iter().filter(|c| c.enabled).collect();
    let mut connected = 0;
    let mut failed = 0;

    for config in &enabled {
        match mcp.connect_server(config).await {
            Ok(()) => connected += 1,
            Err(e) => {
                println!("[MCP Sync] Failed to connect '{}': {}", config.name, e);
                failed += 1;
            }
        }
    }

    let result = McpSyncResult {
        added: added.clone(),
        skipped: skipped.clone(),
        connected,
        failed,
    };

    println!(
        "[MCP Sync] Added {} servers, skipped {} duplicates, connected {}/{} servers",
        added.len(),
        skipped.len(),
        connected,
        connected + failed,
    );

    Ok(result)
}
