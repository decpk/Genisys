use std::fs;
use std::path::PathBuf;

use crate::mcp::types::McpServerConfig;

const MCP_CONFIG_FILENAME: &str = "mcp-servers.json";

/// Get the path to the MCP config file.
fn config_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("genisys")
        .join(".genisys-data");
    data_dir.join(MCP_CONFIG_FILENAME)
}

/// Load MCP server configurations from disk.
pub fn load_configs() -> Vec<McpServerConfig> {
    let path = config_path();
    if !path.exists() {
        return Vec::new();
    }
    fs::read_to_string(&path)
        .ok()
        .and_then(|data| serde_json::from_str(&data).ok())
        .unwrap_or_default()
}

/// Save MCP server configurations to disk.
pub fn save_configs(configs: &[McpServerConfig]) -> Result<(), String> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {e}"))?;
    }
    let json = serde_json::to_string_pretty(configs)
        .map_err(|e| format!("Failed to serialize configs: {e}"))?;
    fs::write(&path, json).map_err(|e| format!("Failed to write config file: {e}"))?;
    Ok(())
}

/// Add or update an MCP server config. If a config with the same name exists, it's replaced.
pub fn upsert_config(config: McpServerConfig) -> Result<Vec<McpServerConfig>, String> {
    let mut configs = load_configs();
    if let Some(pos) = configs.iter().position(|c| c.name == config.name) {
        configs[pos] = config;
    } else {
        configs.push(config);
    }
    save_configs(&configs)?;
    Ok(configs)
}

/// Remove an MCP server config by name.
pub fn remove_config(name: &str) -> Result<Vec<McpServerConfig>, String> {
    let mut configs = load_configs();
    configs.retain(|c| c.name != name);
    save_configs(&configs)?;
    Ok(configs)
}
