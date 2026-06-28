use tauri::{Emitter, State};

use crate::mcp::config;
use crate::mcp::McpManager;

const MAX_RETRIES: usize = 2;
const RETRY_DELAY_MS: u64 = 2000;

/// Connect to all enabled MCP servers from saved config.
/// Retries each failed server up to MAX_RETRIES times with a delay.
#[tauri::command]
pub async fn cmd_mcp_connect_all(
    app: tauri::AppHandle,
    mcp: State<'_, McpManager>,
) -> Result<String, String> {
    let configs = config::load_configs();
    let enabled: Vec<_> = configs.iter().filter(|c| c.enabled).collect();
    let total = enabled.len();
    let mut connected = 0;

    for config in &enabled {
        let mut attempts = 0;
        loop {
            match mcp.connect_server(config).await {
                Ok(()) => {
                    connected += 1;
                    break;
                }
                Err(e) => {
                    attempts += 1;
                    if attempts > MAX_RETRIES {
                        println!("[MCP] Failed to connect '{}' after {} attempts: {}", config.name, attempts, e);
                        break;
                    }
                    println!("[MCP] Retrying '{}' (attempt {}/{}): {}", config.name, attempts, MAX_RETRIES, e);
                    tokio::time::sleep(std::time::Duration::from_millis(RETRY_DELAY_MS)).await;
                }
            }
        }
    }

    // Emit status change event so frontend can update
    let configs_for_summary = config::load_configs();
    let summaries = mcp.get_server_summaries(&configs_for_summary).await;
    let _ = app.emit("mcp-status-changed", &summaries);

    Ok(format!("Connected {}/{} MCP servers", connected, total))
}
