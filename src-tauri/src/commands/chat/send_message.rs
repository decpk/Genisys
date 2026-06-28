use crate::commands::AppState;
use crate::commands::chat::tools;
use crate::commands::chat::crawl_webpage::crawl_url;
use crate::commands::chat::search_images::search_images_wikimedia;
use crate::database::load_messages_for_api;
use crate::ai_provider::resolve_provider;
use crate::mcp::McpManager;
use serde_json::Value;
use tauri::{Emitter, Manager};

use crate::prompts::agentic_system_prompt::AGENTIC_SYSTEM_PROMPT;

const MAX_TOOL_ITERATIONS: usize = 25;

#[tauri::command]
pub async fn cmd_chat_send_message(
    app: tauri::AppHandle,
    stream_id: String,
    conversation_id: String,
    model: Option<String>,
    system_prompt: Option<String>,
    repo_path: Option<String>,
    command_tools: Option<Vec<String>>,
    enable_tools: Option<bool>,
    max_tools: Option<usize>,
) {
    let fn_start = std::time::Instant::now();
    println!("[ChatFlow] cmd_chat_send_message() | repo_path: {:?} | command_tools: {:?} | enable_tools: {:?} | max_tools: {:?}", repo_path, command_tools, enable_tools, max_tools);
    let client = reqwest::Client::new();
    let model = model.unwrap_or_else(|| "gpt-4.1".into());

    let (ct, ep) = match resolve_provider(&model) {
        Ok(p) => (p.api_key, p.base_url),
        Err(e) => { let _ = app.emit("chat-stream-error", serde_json::json!({"streamId":stream_id,"error":e})); return; }
    };

    // When enable_tools is explicitly false, skip all tool assembly
    let tools_enabled = enable_tools.unwrap_or(true);
    let has_command_tools = tools_enabled && command_tools.as_ref().map_or(false, |ct| !ct.is_empty());

    // Check for MCP tools from connected servers
    let mcp_manager = app.state::<McpManager>();
    let mcp_tool_defs = if tools_enabled {
        mcp_manager.get_all_tool_definitions().await
    } else {
        Vec::new()
    };
    let has_mcp_tools = !mcp_tool_defs.is_empty();

    let agentic = tools_enabled && (repo_path.is_some() || has_command_tools || has_mcp_tools);

    // Build initial messages from DB
    let mut messages = {
        let state = app.state::<AppState>();
        let images_dir = app
            .path()
            .app_data_dir()
            .map(|d| d.join("chat-images"))
            .unwrap_or_else(|_| std::path::PathBuf::from("chat-images"));
        let db_messages = load_messages_for_api(&state.db, &conversation_id, &images_dir);
        let mut msgs: Vec<Value> = Vec::new();

        // System prompt: combine user's custom prompt + agentic prompt if tools enabled
        let mut sys = String::new();
        if let Some(ref sp) = system_prompt {
            if !sp.is_empty() {
                sys.push_str(sp);
            }
        }
        if agentic {
            if !sys.is_empty() { sys.push_str("\n\n"); }
            sys.push_str(AGENTIC_SYSTEM_PROMPT);
        }
        if !sys.is_empty() {
            msgs.push(serde_json::json!({"role": "system", "content": sys}));
        }
        msgs.extend(db_messages);
        msgs
    };

    println!("[ChatFlow] loaded {} messages for conversation {}", messages.len(), conversation_id);

    // Validate last message is from user
    if let Some(last) = messages.last() {
        if last["role"].as_str().unwrap_or("") != "user" {
            let _ = app.emit("chat-stream-error", serde_json::json!({"streamId":stream_id,"error":"Cannot send: conversation does not end with a user message."}));
            return;
        }
    } else {
        let _ = app.emit("chat-stream-error", serde_json::json!({"streamId":stream_id,"error":"Cannot send: no messages in conversation"}));
        return;
    }

    // Tool definitions: repo tools (when repo attached) + command tools + MCP tools
    let tool_defs = if agentic {
        let mut defs = if repo_path.is_some() {
            tools::get_tool_definitions()
        } else {
            Vec::new()
        };
        if let Some(ref ct) = command_tools {
            defs.extend(tools::get_command_tool_definitions(ct));
        }
        // Add MCP tools from connected servers
        if has_mcp_tools {
            defs.extend(mcp_tool_defs);
        }
        // Truncate to max_tools limit (default 128 — OpenAI's max)
        let limit = max_tools.unwrap_or(128);
        if defs.len() > limit {
            println!("[ChatFlow] truncating tools from {} to {}", defs.len(), limit);
            defs.truncate(limit);
        }
        if defs.is_empty() { None } else { Some(defs) }
    } else {
        None
    };

    // Agentic loop
    let mut iteration = 0;
    loop {
        iteration += 1;
        if iteration > MAX_TOOL_ITERATIONS {
            println!("[ChatFlow] max tool iterations ({}) reached, forcing stop", MAX_TOOL_ITERATIONS);
            let _ = app.emit("chat-stream-chunk", serde_json::json!({"streamId":stream_id,"token":"\n\n*[Reached maximum tool call limit]*"}));
            break;
        }

        println!("[ChatFlow] iteration {} → POST {}/chat/completions (model: {})", iteration, ep, model);

        // Build request body (built once per iteration; reused across retry attempts)
        let mut body = serde_json::json!({
            "model": model,
            "messages": messages,
            "stream": true,
        });
        if let Some(ref tools) = tool_defs {
            body["tools"] = serde_json::json!(tools);
            body["tool_choice"] = serde_json::json!("auto");
        }

        // Accumulators live across retry attempts so the post-loop tool handling can read them.
        let mut content_text = String::new();
        let mut tool_calls: Vec<ToolCallAccumulator> = Vec::new();
        let mut finish_reason = String::new();

        // Network attempt loop: retry the POST + SSE stream on a transient failure, but
        // ONLY while nothing has been emitted yet, so streamed tokens are never duplicated.
        // Intermittent mid-stream drops on long generations (e.g. Library books) otherwise
        // surface as "error decoding response body" and fail the whole generation.
        use futures_util::StreamExt;
        const MAX_STREAM_ATTEMPTS: u32 = 3;
        let mut attempt: u32 = 0;
        'attempt: loop {
            attempt += 1;
            content_text.clear();
            tool_calls.clear();
            finish_reason.clear();

            let resp = match client.post(format!("{ep}/chat/completions"))
                .header("Authorization", format!("Bearer {ct}"))
                .header("Content-Type","application/json")
                .header("User-Agent","Genisys")
                // Ask for an uncompressed SSE stream (less fragile to mid-stream truncation).
                .header("Accept-Encoding","identity")
                .json(&body).send().await {
                Ok(r) => r,
                Err(e) => {
                    println!("[ChatFlow] request error (attempt {}/{}): {:?}", attempt, MAX_STREAM_ATTEMPTS, e);
                    if attempt < MAX_STREAM_ATTEMPTS {
                        tokio::time::sleep(std::time::Duration::from_millis(400 * attempt as u64)).await;
                        continue 'attempt;
                    }
                    let _ = app.emit("chat-stream-error", serde_json::json!({"streamId":stream_id,"error":format!("Request failed after {attempt} attempts: {e}")}));
                    return;
                }
            };

            if !resp.status().is_success() {
                let st = resp.status().as_u16();
                let body_txt = resp.text().await.unwrap_or_default();
                println!("[ChatFlow] HTTP error {} body: {}", st, body_txt);
                // Retry transient server errors (429 / 5xx) before giving up.
                if (st == 429 || st >= 500) && attempt < MAX_STREAM_ATTEMPTS {
                    tokio::time::sleep(std::time::Duration::from_millis(400 * attempt as u64)).await;
                    continue 'attempt;
                }
                let _ = app.emit("chat-stream-error", serde_json::json!({"streamId":stream_id,"error":format!("HTTP {st}: {body_txt}")}));
                return;
            }

            // Stream and parse the SSE response
            let mut stream = resp.bytes_stream();
            let mut sse_buffer = String::new();

            while let Some(chunk) = stream.next().await {
                match chunk {
                    Ok(bytes) => {
                        sse_buffer.push_str(&String::from_utf8_lossy(&bytes));
                        while let Some(pos) = sse_buffer.find('\n') {
                            let line = sse_buffer[..pos].trim().to_string();
                            sse_buffer = sse_buffer[pos + 1..].to_string();
                            if line.is_empty() || !line.starts_with("data: ") { continue; }
                            let data = &line[6..];
                            if data == "[DONE]" { continue; }
                            if let Ok(parsed) = serde_json::from_str::<Value>(data) {
                                let delta = &parsed["choices"][0]["delta"];

                                // Debug: log raw delta when it contains tool_calls
                                if delta["tool_calls"].is_array() {
                                    println!("[ChatFlow] SSE delta (tool_calls): {}", serde_json::to_string(delta).unwrap_or_default());
                                }

                                // Accumulate text content
                                if let Some(token) = delta["content"].as_str() {
                                    content_text.push_str(token);
                                    let _ = app.emit("chat-stream-chunk", serde_json::json!({"streamId":stream_id,"token":token}));
                                }

                                // Reasoning channels (provider-specific names)
                                let reasoning_token = delta["reasoning"]
                                    .as_str()
                                    .or_else(|| delta["reasoning_content"].as_str())
                                    .or_else(|| delta["thinking"].as_str());
                                if let Some(rtok) = reasoning_token {
                                    if !rtok.is_empty() {
                                        let _ = app.emit("chat-stream-reasoning-chunk", serde_json::json!({"streamId":stream_id,"token":rtok}));
                                    }
                                }

                                // Accumulate tool calls
                                if let Some(tc_arr) = delta["tool_calls"].as_array() {
                                    for tc in tc_arr {
                                        let idx = tc["index"].as_u64().unwrap_or(0) as usize;
                                        // Extend vector if needed
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

                                // Check finish reason
                                if let Some(fr) = parsed["choices"][0]["finish_reason"].as_str() {
                                    finish_reason = fr.to_string();
                                }
                            }
                        }
                    }
                    Err(e) => {
                        println!("[ChatFlow] stream error (attempt {}/{}): {:?}", attempt, MAX_STREAM_ATTEMPTS, e);
                        let nothing_streamed = content_text.is_empty() && tool_calls.is_empty();
                        // Nothing emitted yet → safe to retry the whole request (no duplicate tokens).
                        if nothing_streamed && attempt < MAX_STREAM_ATTEMPTS {
                            tokio::time::sleep(std::time::Duration::from_millis(400 * attempt as u64)).await;
                            continue 'attempt;
                        }
                        if nothing_streamed {
                            let _ = app.emit("chat-stream-error", serde_json::json!({"streamId":stream_id,"error":format!("Connection interrupted while streaming: {e}")}));
                            return;
                        }
                        // Partial content already streamed — finalize it gracefully instead of
                        // failing. Drop any half-accumulated tool calls so the post-loop tool
                        // branch is skipped and we fall through to the normal chat-stream-done.
                        println!("[ChatFlow] finalizing partial content ({} chars) after stream interruption", content_text.len());
                        tool_calls.clear();
                        break;
                    }
                }
            }

            // Stream finished (cleanly or gracefully finalized) — leave the retry loop.
            break 'attempt;
        }

        println!("[ChatFlow] iteration {} done — finish_reason: {}, tool_calls: {}, content_len: {}",
            iteration, finish_reason, tool_calls.len(), content_text.len());

        // If the model wants to call tools, execute them and continue the loop
        if (finish_reason == "tool_calls" || finish_reason == "stop") && !tool_calls.is_empty() {
            let repo = repo_path.as_deref().unwrap_or("");

            // Filter out tool calls with missing id or name
            let valid_tool_calls: Vec<&ToolCallAccumulator> = tool_calls.iter()
                .filter(|tc| !tc.id.is_empty() && !tc.name.is_empty())
                .collect();

            if valid_tool_calls.is_empty() {
                println!("[ChatFlow] no valid tool calls (missing id/name), breaking loop");
                for (i, tc) in tool_calls.iter().enumerate() {
                    println!("[ChatFlow]   tool_call[{}]: id='{}' name='{}' args='{}'", i, tc.id, tc.name, tc.arguments);
                }
                break;
            }

            // Build the assistant message with tool_calls
            // OpenAI format requires content to be null (not missing) when tool_calls present
            let tc_values: Vec<Value> = valid_tool_calls.iter().map(|tc| {
                serde_json::json!({
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.name,
                        "arguments": tc.arguments,
                    }
                })
            }).collect();

            let assistant_msg = if content_text.is_empty() {
                serde_json::json!({
                    "role": "assistant",
                    "content": null,
                    "tool_calls": tc_values,
                })
            } else {
                serde_json::json!({
                    "role": "assistant",
                    "content": content_text,
                    "tool_calls": tc_values,
                })
            };

            println!("[ChatFlow] assistant_msg: {}", serde_json::to_string(&assistant_msg).unwrap_or_default());
            messages.push(assistant_msg);

            // Execute each tool and add result messages
            for tc in &valid_tool_calls {
                let args: Value = serde_json::from_str(&tc.arguments).unwrap_or(serde_json::json!({}));
                println!("[ChatFlow] executing tool: {} id: {} args: {}", tc.name, tc.id, tc.arguments);

                // Emit tool start event to frontend
                let _ = app.emit("chat-stream-tool-start", serde_json::json!({
                    "streamId": stream_id,
                    "toolName": tc.name,
                    "args": args,
                }));

                // Dispatch: MCP tools → MCP manager, command tools (async) vs repo tools (sync)
                let result = if McpManager::is_mcp_tool(&tc.name) {
                    match mcp_manager.execute_tool(&tc.name, args.clone()).await {
                        Ok(r) => r,
                        Err(e) => format!("MCP tool error: {e}"),
                    }
                } else {
                    match tc.name.as_str() {
                    "crawl_webpage" => {
                        let url = args["url"].as_str().unwrap_or("").to_string();
                        match tokio::task::spawn_blocking(move || crawl_url(&url)).await {
                            Ok(Ok(val)) => {
                                // Format crawl result as readable text for the AI
                                let title = val["title"].as_str().unwrap_or("");
                                let description = val["description"].as_str().unwrap_or("");
                                let content = val["content"].as_str().unwrap_or("");
                                format!(
                                    "# {}\n\n{}\n\n---\n\n{}",
                                    title, description, content
                                )
                            }
                            Ok(Err(e)) => format!("Error crawling webpage: {e}"),
                            Err(e) => format!("Error crawling webpage: {e}"),
                        }
                    }
                    "search_images" => {
                        let query = args["query"].as_str().unwrap_or("").to_string();
                        let count = args
                            .get("count")
                            .and_then(|v| v.as_u64())
                            .unwrap_or(5)
                            .min(10) as u32;
                        match tokio::task::spawn_blocking(move || {
                            search_images_wikimedia(&query, count)
                        })
                        .await
                        {
                            Ok(Ok(val)) => serde_json::to_string_pretty(&val)
                                .unwrap_or_else(|_| val.to_string()),
                            Ok(Err(e)) => format!("Error searching images: {e}"),
                            Err(e) => format!("Error searching images: {e}"),
                        }
                    }
                    _ => tools::execute_tool(&tc.name, &args, repo),
                    }
                };

                println!("[ChatFlow] tool result ({}chars): {}", result.len(),
                    if result.len() > 200 { &result[..200] } else { &result });

                // Emit tool result event to frontend
                let _ = app.emit("chat-stream-tool-result", serde_json::json!({
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

            // Reset for next iteration
            content_text.clear();
            tool_calls.clear();
            continue;
        }

        // No more tool calls — final response is done
        break;
    }

    let _ = app.emit("chat-stream-done", serde_json::json!({"streamId":stream_id}));
    let fn_elapsed = fn_start.elapsed();
    println!("[ChatFlow] cmd_chat_send_message() complete | iterations: {} | total: {:.2}ms",
        iteration, fn_elapsed.as_secs_f64() * 1000.0);
}

#[derive(Default)]
struct ToolCallAccumulator {
    id: String,
    name: String,
    arguments: String,
}
