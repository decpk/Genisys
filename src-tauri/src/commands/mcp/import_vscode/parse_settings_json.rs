use std::fs;

use serde_json::Value;

use super::parse_mcp_json::parse_mcp_json;
use super::strip_comments::strip_js_comments;
use super::types::DiscoveredMcpServer;
use super::vscode_settings_paths::get_vscode_settings_paths;

/// Parse VS Code's global settings.json files for MCP server configurations.
/// Checks all VS Code variants (Code, Code Insiders, Cursor).
pub fn discover_from_global_settings(results: &mut Vec<DiscoveredMcpServer>) {
    let settings_paths = get_vscode_settings_paths();

    for settings_path in &settings_paths {
        if !settings_path.exists() {
            continue;
        }

        let content = match fs::read_to_string(settings_path) {
            Ok(c) => c,
            Err(_) => continue,
        };

        let cleaned = strip_js_comments(&content);
        let parsed: Value = match serde_json::from_str(&cleaned) {
            Ok(v) => v,
            Err(_) => continue,
        };

        // VS Code stores MCP servers under "mcp" key in settings.json
        // Format: { "mcp": { "servers": { ... } } }
        if let Some(mcp_config) = parsed.get("mcp") {
            let variant_name = settings_path
                .parent()
                .and_then(|p| p.parent())
                .and_then(|p| p.file_name())
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| "vscode".to_string());

            let source = format!("{}/User/settings.json", variant_name);
            parse_mcp_json(mcp_config, &source, results);
        }
    }
}
