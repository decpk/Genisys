use crate::commands::explorer::explorer_ai_tools;
use crate::ai_provider::resolve_provider;
use crate::prompts::explorer_ai_system_prompt::EXPLORER_AI_SYSTEM_PROMPT;
use serde_json::Value;
use tauri::Emitter;
use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use std::time::Duration;
use tokio::sync::oneshot;

const MAX_TOOL_ITERATIONS: usize = 25;
const MAX_DESTRUCTIVE_OPS: usize = 50;
const HTTP_TIMEOUT_SECS: u64 = 120;
const CONNECT_TIMEOUT_SECS: u64 = 15;
/// How long to wait for the user to approve/deny a shell command before giving up.
const SHELL_CONFIRM_TIMEOUT_SECS: u64 = 300;

/// Registry of pending shell-command approvals, keyed by a per-request confirm id.
/// The agentic loop inserts a oneshot sender and awaits the receiver; the
/// `cmd_explorer_ai_shell_respond` command (invoked from the UI) sends the
/// user's decision (true = approved, false = denied).
static SHELL_CONFIRM_REGISTRY: OnceLock<Mutex<HashMap<String, oneshot::Sender<bool>>>> =
    OnceLock::new();

fn shell_confirm_registry() -> &'static Mutex<HashMap<String, oneshot::Sender<bool>>> {
    SHELL_CONFIRM_REGISTRY.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Called from the frontend when the user approves or denies a pending shell command.
#[tauri::command]
pub fn cmd_explorer_ai_shell_respond(confirm_id: String, approved: bool) {
    println!(
        "[ExplorerAI] cmd_explorer_ai_shell_respond | confirm_id: {} | approved: {}",
        confirm_id, approved
    );
    if let Some(sender) = shell_confirm_registry()
        .lock()
        .ok()
        .and_then(|mut reg| reg.remove(&confirm_id))
    {
        let _ = sender.send(approved);
    }
}

#[tauri::command]
pub async fn cmd_explorer_ai_command(
    app: tauri::AppHandle,
    stream_id: String,
    root_path: String,
    instruction: String,
    conversation_history: Option<Vec<Value>>,
    model: Option<String>,
    max_tools: Option<usize>,
) {
    println!(
        "[ExplorerAI] cmd_explorer_ai_command() | root: {} | model: {:?} | max_tools: {:?} | instruction: {}",
        root_path, model, max_tools, instruction
    );

    // Run the inner logic and guarantee we always emit done or error
    let result = run_explorer_ai(
        &app, &stream_id, &root_path, &instruction, conversation_history, model, max_tools,
    ).await;

    if let Err(e) = result {
        let _ = app.emit("explorer-ai-error", serde_json::json!({
            "streamId": stream_id,
            "error": e
        }));
    }
    // Always emit done so the frontend never stays stuck
    let _ = app.emit("explorer-ai-done", serde_json::json!({"streamId": stream_id}));
    println!("[ExplorerAI] cmd_explorer_ai_command() finished");
}

async fn run_explorer_ai(
    app: &tauri::AppHandle,
    stream_id: &str,
    root_path: &str,
    instruction: &str,
    conversation_history: Option<Vec<Value>>,
    model: Option<String>,
    max_tools: Option<usize>,
) -> Result<(), String> {
    let model = model
        .filter(|m| !m.is_empty())
        .unwrap_or_else(|| "gpt-4.1".into());

    let provider = resolve_provider(&model)?;
    let ct = provider.api_key;
    let ep = provider.base_url;

    // Build messages
    let mut messages: Vec<Value> = Vec::new();
    messages.push(serde_json::json!({
        "role": "system",
        "content": format!("{}\n\nRoot directory: {}", EXPLORER_AI_SYSTEM_PROMPT, root_path)
    }));

    if let Some(history) = conversation_history {
        messages.extend(history);
    }

    messages.push(serde_json::json!({
        "role": "user",
        "content": instruction
    }));

    let mut tool_defs = explorer_ai_tools::get_explorer_tool_definitions();

    // Truncate to max_tools limit (default 128 — OpenAI's max).
    // Mirrors the pattern in cmd_chat_send_message so the user's
    // per-panel "Max tools" setting is respected.
    {
        let limit = max_tools.unwrap_or(128);
        if tool_defs.len() > limit {
            println!(
                "[ExplorerAI] truncating tools from {} to {}",
                tool_defs.len(),
                limit
            );
            tool_defs.truncate(limit);
        }
    }

    let mut iteration = 0;
    let mut destructive_ops_count: usize = 0;

    loop {
        iteration += 1;
        if iteration > MAX_TOOL_ITERATIONS {
            let _ = app.emit("explorer-ai-chunk", serde_json::json!({
                "streamId": stream_id,
                "token": "\n\n*[Reached maximum tool call limit]*"
            }));
            break;
        }

        println!(
            "[ExplorerAI] iteration {} → POST {}/chat/completions (model: {}, tools: {})",
            iteration,
            ep,
            model,
            tool_defs.len()
        );

        let body = serde_json::json!({
            "model": model,
            "messages": messages,
            "stream": true,
            "tools": tool_defs,
            "tool_choice": "auto",
        });

        // Use a separate client without global timeout for SSE streaming
        // (the global timeout would kill long-running SSE connections)
        let sse_client = reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(CONNECT_TIMEOUT_SECS))
            .build()
            .map_err(|e| format!("Failed to create SSE client: {e}"))?;

        let resp = sse_client.post(format!("{ep}/chat/completions"))
            .header("Authorization", format!("Bearer {ct}"))
            .header("Content-Type", "application/json")
            .header("User-Agent", "Genisys")
            .json(&body).send().await
            .map_err(|e| format!("API request failed: {e}"))?;

        if !resp.status().is_success() {
            let st = resp.status().as_u16();
            let body_text = resp.text().await.unwrap_or_default();
            return Err(format!("HTTP {st}: {body_text}"));
        }

        // Stream and parse SSE with a per-chunk timeout
        use futures_util::StreamExt;
        let mut stream = resp.bytes_stream();
        let mut sse_buffer = String::new();
        let mut content_text = String::new();
        let mut tool_calls: Vec<ToolCallAccumulator> = Vec::new();
        let mut finish_reason = String::new();

        loop {
            // Timeout each SSE chunk — if we get nothing for 90s, the connection is dead
            let chunk_result = tokio::time::timeout(
                Duration::from_secs(90),
                stream.next()
            ).await;

            match chunk_result {
                Err(_) => {
                    // Timeout waiting for SSE chunk
                    println!("[ExplorerAI] SSE chunk timeout after 90s");
                    return Err("Response timed out — the AI took too long to respond. Try a simpler instruction.".to_string());
                }
                Ok(None) => break, // Stream ended normally
                Ok(Some(Err(e))) => {
                    return Err(format!("Stream error: {e}"));
                }
                Ok(Some(Ok(bytes))) => {
                    sse_buffer.push_str(&String::from_utf8_lossy(&bytes));
                    while let Some(pos) = sse_buffer.find('\n') {
                        let line = sse_buffer[..pos].trim().to_string();
                        sse_buffer = sse_buffer[pos + 1..].to_string();
                        if line.is_empty() || !line.starts_with("data: ") { continue; }
                        let data = &line[6..];
                        if data == "[DONE]" { continue; }
                        if let Ok(parsed) = serde_json::from_str::<Value>(data) {
                            let delta = &parsed["choices"][0]["delta"];

                            if let Some(token) = delta["content"].as_str() {
                                content_text.push_str(token);
                                let _ = app.emit("explorer-ai-chunk", serde_json::json!({
                                    "streamId": stream_id,
                                    "token": token
                                }));
                            }

                            // Reasoning channels (provider-specific names)
                            let reasoning_token = delta["reasoning"]
                                .as_str()
                                .or_else(|| delta["reasoning_content"].as_str())
                                .or_else(|| delta["thinking"].as_str());
                            if let Some(rtok) = reasoning_token {
                                if !rtok.is_empty() {
                                    let _ = app.emit("explorer-ai-reasoning-chunk", serde_json::json!({
                                        "streamId": stream_id,
                                        "token": rtok
                                    }));
                                }
                            }

                            if let Some(tc_arr) = delta["tool_calls"].as_array() {
                                for tc in tc_arr {
                                    let idx = tc["index"].as_u64().unwrap_or(0) as usize;
                                    while tool_calls.len() <= idx {
                                        tool_calls.push(ToolCallAccumulator::default());
                                    }
                                    if let Some(id) = tc["id"].as_str() {
                                        tool_calls[idx].id = id.to_string();
                                    }
                                    if let Some(name) = tc["function"]["name"].as_str() {
                                        tool_calls[idx].name = name.to_string();
                                    }
                                    if let Some(args) = tc["function"]["arguments"].as_str() {
                                        tool_calls[idx].arguments.push_str(args);
                                    }
                                }
                            }

                            if let Some(fr) = parsed["choices"][0]["finish_reason"].as_str() {
                                finish_reason = fr.to_string();
                            }
                        }
                    }
                }
            }
        }

        println!("[ExplorerAI] iteration {} done — finish_reason: {}, tool_calls: {}, content_len: {}",
            iteration, finish_reason, tool_calls.len(), content_text.len());

        // Handle tool calls
        if (finish_reason == "tool_calls" || finish_reason == "stop") && !tool_calls.is_empty() {
            let valid_tool_calls: Vec<&ToolCallAccumulator> = tool_calls.iter()
                .filter(|tc| !tc.id.is_empty() && !tc.name.is_empty())
                .collect();

            if valid_tool_calls.is_empty() { break; }

            // Check destructive operation limit
            let destructive_tools = ["delete_item", "rename_item", "move_item"];
            let new_destructive = valid_tool_calls.iter()
                .filter(|tc| destructive_tools.contains(&tc.name.as_str()))
                .count();

            if destructive_ops_count + new_destructive > MAX_DESTRUCTIVE_OPS {
                let _ = app.emit("explorer-ai-chunk", serde_json::json!({
                    "streamId": stream_id,
                    "token": format!("\n\n⚠️ **Safety limit reached**: Maximum {} destructive operations per command.", MAX_DESTRUCTIVE_OPS)
                }));
                break;
            }
            destructive_ops_count += new_destructive;

            // Build assistant message
            let tc_values: Vec<Value> = valid_tool_calls.iter().map(|tc| {
                serde_json::json!({
                    "id": tc.id,
                    "type": "function",
                    "function": { "name": tc.name, "arguments": tc.arguments }
                })
            }).collect();

            let assistant_msg = if content_text.is_empty() {
                serde_json::json!({"role": "assistant", "content": null, "tool_calls": tc_values})
            } else {
                serde_json::json!({"role": "assistant", "content": content_text, "tool_calls": tc_values})
            };
            messages.push(assistant_msg);

            // Execute each tool on a blocking thread to avoid starving Tokio
            for tc in &valid_tool_calls {
                let args: Value = serde_json::from_str(&tc.arguments).unwrap_or(serde_json::json!({}));
                println!("[ExplorerAI] executing tool: {} args: {}", tc.name, tc.arguments);

                let _ = app.emit("explorer-ai-tool-start", serde_json::json!({
                    "streamId": stream_id,
                    "toolName": tc.name,
                    "args": args,
                }));

                let result = if tc.name == "run_shell_command" {
                    // Shell commands require explicit user approval before running.
                    let command = args["command"].as_str().unwrap_or("").to_string();
                    let cwd = args["cwd"].as_str().map(|s| s.to_string());

                    if command.trim().is_empty() {
                        "Command not executed: no command was provided.".to_string()
                    } else {
                        let confirm_id = uuid::Uuid::new_v4().to_string();
                        let (tx, rx) = oneshot::channel::<bool>();
                        if let Ok(mut reg) = shell_confirm_registry().lock() {
                            reg.insert(confirm_id.clone(), tx);
                        }

                        // Ask the frontend to show an approval card.
                        let _ = app.emit("explorer-ai-shell-confirm-request", serde_json::json!({
                            "streamId": stream_id,
                            "confirmId": confirm_id,
                            "command": command,
                            "cwd": cwd,
                        }));

                        // Wait for the user's decision (or time out).
                        let approved = match tokio::time::timeout(
                            Duration::from_secs(SHELL_CONFIRM_TIMEOUT_SECS),
                            rx,
                        ).await {
                            Ok(Ok(decision)) => decision,
                            _ => {
                                // Clean up the registry entry on timeout/cancel.
                                if let Ok(mut reg) = shell_confirm_registry().lock() {
                                    reg.remove(&confirm_id);
                                }
                                false
                            }
                        };

                        if !approved {
                            "Command not executed: the user denied or did not approve it.".to_string()
                        } else {
                            let cmd = command.clone();
                            let cwd_opt = cwd.clone();
                            let tool_root = root_path.to_string();
                            match tokio::task::spawn_blocking(move || {
                                explorer_ai_tools::exec_shell_command(
                                    &cmd,
                                    cwd_opt.as_deref(),
                                    &tool_root,
                                )
                            })
                            .await
                            {
                                Ok(r) => r,
                                Err(e) => format!("Command execution failed: {e}"),
                            }
                        }
                    }
                } else {
                    // Run tool on blocking thread with a 30s timeout
                    let tool_name = tc.name.clone();
                    let tool_args = args.clone();
                    let tool_root = root_path.to_string();
                    match tokio::time::timeout(
                        Duration::from_secs(30),
                        tokio::task::spawn_blocking(move || {
                            explorer_ai_tools::execute_explorer_tool(&tool_name, &tool_args, &tool_root)
                        })
                    ).await {
                        Ok(Ok(r)) => r,
                        Ok(Err(e)) => format!("Tool execution failed: {e}"),
                        Err(_) => format!("Tool '{}' timed out after 30s — the directory may be too large. Try a more specific path.", tc.name),
                    }
                };

                println!("[ExplorerAI] tool result ({}chars): {}",
                    result.len(), if result.len() > 200 { &result[..200] } else { &result });

                let _ = app.emit("explorer-ai-tool-result", serde_json::json!({
                    "streamId": stream_id,
                    "toolName": tc.name,
                    "result": if result.len() > 500 { format!("{}...", &result[..500]) } else { result.clone() },
                }));

                messages.push(serde_json::json!({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                }));
            }

            content_text.clear();
            tool_calls.clear();
            continue;
        }

        // No more tool calls — done
        break;
    }

    Ok(())
}

#[derive(Default)]
struct ToolCallAccumulator {
    id: String,
    name: String,
    arguments: String,
}
