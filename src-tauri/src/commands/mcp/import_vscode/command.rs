use super::discover_projects::discover_vscode_project_paths;
use super::parse_settings_json::discover_from_global_settings;
use super::scan_directory::scan_directory_for_mcp;
use super::types::DiscoveredMcpServer;

/// Discover all MCP servers available to the user.
/// 1. Reads VS Code's state.vscdb to find recently-opened projects (falls back to hardcoded dirs)
/// 2. Scans each project for .vscode/mcp.json
/// 3. Also reads VS Code's global settings.json for MCP servers
/// Deduplicates by server name (first occurrence wins).
#[tauri::command]
pub async fn cmd_mcp_import_vscode() -> Result<Vec<DiscoveredMcpServer>, String> {
    let mut discovered: Vec<DiscoveredMcpServer> = Vec::new();

    // 1. Discover project paths from VS Code's internal database
    let project_paths = discover_vscode_project_paths();

    // 2. Scan each project for .vscode/mcp.json
    for root in &project_paths {
        scan_directory_for_mcp(root, 3, &mut discovered);
    }

    // 3. Also check VS Code's global settings.json for MCP servers
    discover_from_global_settings(&mut discovered);

    // 4. Deduplicate by server name (first occurrence wins)
    let mut seen = std::collections::HashSet::new();
    discovered.retain(|server| seen.insert(server.name.clone()));

    println!(
        "[MCP Import] Discovered {} unique servers (VS Code)",
        discovered.len()
    );

    Ok(discovered)
}
