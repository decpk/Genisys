use std::fs;
use std::path::PathBuf;

use serde_json::Value;

use super::parse_mcp_json::parse_mcp_json;
use super::strip_comments::strip_js_comments;
use super::types::DiscoveredMcpServer;

/// Recursively scan a directory for .vscode/mcp.json files up to max_depth.
pub fn scan_directory_for_mcp(
    dir: &PathBuf,
    max_depth: usize,
    results: &mut Vec<DiscoveredMcpServer>,
) {
    if max_depth == 0 {
        return;
    }

    let mcp_path = dir.join(".vscode").join("mcp.json");
    if mcp_path.exists() {
        if let Ok(content) = fs::read_to_string(&mcp_path) {
            let cleaned = strip_js_comments(&content);
            if let Ok(parsed) = serde_json::from_str::<Value>(&cleaned) {
                let source = mcp_path
                    .strip_prefix(dirs::home_dir().unwrap_or_default())
                    .unwrap_or(&mcp_path)
                    .to_string_lossy()
                    .to_string();
                parse_mcp_json(&parsed, &source, results);
            }
        }
    }

    // Recurse into subdirectories (skip hidden dirs, node_modules, target)
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with('.')
                || name == "node_modules"
                || name == "target"
                || name == "build"
                || name == "dist"
            {
                continue;
            }
            scan_directory_for_mcp(&path, max_depth - 1, results);
        }
    }
}
