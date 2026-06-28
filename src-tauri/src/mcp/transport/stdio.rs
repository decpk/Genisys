use std::collections::HashMap;
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;

use crate::mcp::types::{JsonRpcRequest, JsonRpcResponse};

/// Timeout for reading a response from the MCP server.
const READ_TIMEOUT_SECS: u64 = 30;

/// A stdio-based MCP transport that spawns a child process.
pub struct StdioTransport {
    child: Mutex<Child>,
    stdin: Mutex<tokio::process::ChildStdin>,
    stdout: Mutex<BufReader<tokio::process::ChildStdout>>,
    /// Captured stderr output for error diagnostics.
    stderr_buffer: Arc<Mutex<String>>,
    command_label: String,
}

impl StdioTransport {
    /// Spawn a new child process with the given command, args, and env vars.
    pub fn spawn(
        command: &str,
        args: &[String],
        env: &HashMap<String, String>,
    ) -> Result<Self, String> {
        let mut cmd = Command::new(command);
        cmd.args(args)
            .envs(env)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        // Use the shared PATH fix so user-installed CLIs (e.g. npx-based MCP
        // servers) resolve in packaged (adhoc) builds launched from Finder,
        // where the inherited PATH is minimal and omits those dirs.
        cmd.env("PATH", crate::commands::get_fixed_path());

        let command_label = format!("{} {}", command, args.join(" "));

        let mut child = cmd.spawn().map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                format!(
                    "Failed to spawn MCP server '{}': executable '{}' not found on PATH ({})",
                    command_label, command, e
                )
            } else {
                format!("Failed to spawn MCP server '{}': {}", command_label, e)
            }
        })?;

        let stdin = child.stdin.take().ok_or("Failed to capture stdin")?;
        let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
        let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

        // Spawn a background task to continuously read stderr
        let stderr_buffer = Arc::new(Mutex::new(String::new()));
        let stderr_buf_clone = stderr_buffer.clone();
        let cmd_label_clone = command_label.clone();
        tokio::spawn(async move {
            let mut reader = BufReader::new(stderr);
            let mut line = String::new();
            loop {
                line.clear();
                match reader.read_line(&mut line).await {
                    Ok(0) => break, // EOF
                    Ok(_) => {
                        let trimmed = line.trim();
                        if !trimmed.is_empty() {
                            println!("[MCP stderr][{}] {}", cmd_label_clone, trimmed);
                            let mut buf = stderr_buf_clone.lock().await;
                            if buf.len() < 4096 {
                                buf.push_str(trimmed);
                                buf.push('\n');
                            }
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        Ok(Self {
            child: Mutex::new(child),
            stdin: Mutex::new(stdin),
            stdout: Mutex::new(BufReader::new(stdout)),
            stderr_buffer,
            command_label,
        })
    }

    /// Get any stderr output collected so far (for error diagnostics).
    pub async fn get_stderr(&self) -> String {
        self.stderr_buffer.lock().await.clone()
    }

    /// Build a descriptive error message including stderr output.
    async fn build_error(&self, base_msg: &str) -> String {
        let stderr = self.get_stderr().await;
        let exit_info = {
            let mut child = self.child.lock().await;
            match child.try_wait() {
                Ok(Some(status)) => format!(" (exit code: {})", status),
                Ok(None) => " (still running)".to_string(),
                Err(_) => String::new(),
            }
        };

        if stderr.is_empty() {
            format!("{}{} — command: {}", base_msg, exit_info, self.command_label)
        } else {
            // Take last few lines of stderr for the error message
            let last_lines: Vec<&str> = stderr.lines().rev().take(5).collect();
            let stderr_tail: Vec<&str> = last_lines.into_iter().rev().collect();
            format!(
                "{}{}\n\nServer stderr:\n{}",
                base_msg,
                exit_info,
                stderr_tail.join("\n")
            )
        }
    }

    /// Send a JSON-RPC request and read the response (with timeout).
    pub async fn send_request(&self, request: &JsonRpcRequest) -> Result<JsonRpcResponse, String> {
        let json = serde_json::to_string(request)
            .map_err(|e| format!("Failed to serialize request: {e}"))?;

        // Write to stdin
        {
            let mut stdin = self.stdin.lock().await;
            stdin
                .write_all(json.as_bytes())
                .await
                .map_err(|e| format!("Failed to write to stdin: {e}"))?;
            stdin
                .write_all(b"\n")
                .await
                .map_err(|e| format!("Failed to write newline: {e}"))?;
            stdin
                .flush()
                .await
                .map_err(|e| format!("Failed to flush stdin: {e}"))?;
        }

        // Read response from stdout with timeout
        let read_future = self.read_response();
        match tokio::time::timeout(Duration::from_secs(READ_TIMEOUT_SECS), read_future).await {
            Ok(result) => result,
            Err(_) => {
                Err(self.build_error(&format!(
                    "MCP server did not respond within {}s",
                    READ_TIMEOUT_SECS
                )).await)
            }
        }
    }

    /// Read lines from stdout until a valid JSON-RPC response is found.
    async fn read_response(&self) -> Result<JsonRpcResponse, String> {
        let mut line = String::new();
        let mut stdout = self.stdout.lock().await;
        loop {
            line.clear();
            let bytes_read = stdout
                .read_line(&mut line)
                .await
                .map_err(|e| format!("Failed to read from stdout: {e}"))?;
            if bytes_read == 0 {
                // Process closed stdout — get stderr for diagnostics
                drop(stdout); // Release lock before building error
                // Small delay to let stderr reader catch final output
                tokio::time::sleep(Duration::from_millis(100)).await;
                return Err(self.build_error("MCP server closed stdout unexpectedly").await);
            }
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            // Try parsing as JSON-RPC — skip notification lines (no "id")
            if let Ok(resp) = serde_json::from_str::<JsonRpcResponse>(trimmed) {
                if resp.id.is_some() {
                    return Ok(resp);
                }
                // It's a notification (no id) — skip and keep reading
                continue;
            }
            // Not valid JSON — log and skip (could be server log output)
            println!("[MCP stdout][{}] non-JSON line: {}", self.command_label, trimmed);
            continue;
        }
    }

    /// Send a JSON-RPC notification (no response expected).
    pub async fn send_notification(&self, method: &str) -> Result<(), String> {
        let json = serde_json::to_string(&serde_json::json!({
            "jsonrpc": "2.0",
            "method": method,
        }))
        .map_err(|e| format!("Failed to serialize notification: {e}"))?;

        let mut stdin = self.stdin.lock().await;
        stdin
            .write_all(json.as_bytes())
            .await
            .map_err(|e| format!("Failed to write notification: {e}"))?;
        stdin
            .write_all(b"\n")
            .await
            .map_err(|e| format!("Failed to write newline: {e}"))?;
        stdin
            .flush()
            .await
            .map_err(|e| format!("Failed to flush: {e}"))?;

        Ok(())
    }

    /// Kill the child process.
    pub async fn shutdown(&self) {
        let mut child = self.child.lock().await;
        let _ = child.kill().await;
    }

    /// Check if the child process is still running.
    pub async fn is_alive(&self) -> bool {
        let mut child = self.child.lock().await;
        matches!(child.try_wait(), Ok(None))
    }
}
