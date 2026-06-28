use crate::ai_provider::resolve_provider;
use serde_json::Value;
use tauri::Emitter;
use std::time::Duration;

const CONNECT_TIMEOUT_SECS: u64 = 15;

/// Streaming chat-completion command for the Code AI assistant.
///
/// Forwards an OpenAI-style
/// `messages` + `tools` payload to the AI provider, streams content
/// tokens via `code-ai-chunk` events, and emits parsed `tool_calls` in
/// the final `code-ai-done` event so the frontend agentic runner can
/// dispatch tools (with confirmation) and feed results back.
#[tauri::command]
pub async fn cmd_code_ai_completion(
    app: tauri::AppHandle,
    stream_id: String,
    messages: Vec<Value>,
    tools: Vec<Value>,
    model: Option<String>,
) {
    let result = run_completion(&app, &stream_id, messages, tools, model).await;
    if let Err(e) = result {
        let _ = app.emit("code-ai-error", serde_json::json!({
            "streamId": stream_id,
            "error": e
        }));
    }
}

async fn run_completion(
    app: &tauri::AppHandle,
    stream_id: &str,
    messages: Vec<Value>,
    tools: Vec<Value>,
    model: Option<String>,
) -> Result<(), String> {
    let model = model.unwrap_or_else(|| "gpt-4.1".into());

    let provider = resolve_provider(&model)?;
    let ct = provider.api_key;
    let ep = provider.base_url;

    // Build body
    let mut body = serde_json::json!({
        "model": model,
        "messages": messages,
        "stream": true,
    });
    if !tools.is_empty() {
        body["tools"] = serde_json::json!(tools);
        body["tool_choice"] = serde_json::json!("auto");
    }

    // SSE streaming — no global timeout (would kill long SSE connections)
    let sse_client = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(CONNECT_TIMEOUT_SECS))
        .build().map_err(|e| format!("SSE client error: {e}"))?;

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

    use futures_util::StreamExt;
    let mut stream = resp.bytes_stream();
    let mut sse_buffer = String::new();
    let mut content_text = String::new();
    let mut tool_calls: Vec<ToolCallAcc> = Vec::new();
    let mut finish_reason = String::new();

    loop {
        let chunk_result = tokio::time::timeout(
            Duration::from_secs(90), stream.next()
        ).await;

        match chunk_result {
            Err(_) => return Err("Response timed out.".to_string()),
            Ok(None) => break,
            Ok(Some(Err(e))) => return Err(format!("Stream error: {e}")),
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
                            let _ = app.emit("code-ai-chunk", serde_json::json!({
                                "streamId": stream_id, "token": token
                            }));
                        }
                        // Reasoning channels (provider-specific names)
                        let reasoning_token = delta["reasoning"]
                            .as_str()
                            .or_else(|| delta["reasoning_content"].as_str())
                            .or_else(|| delta["thinking"].as_str());
                        if let Some(rtok) = reasoning_token {
                            if !rtok.is_empty() {
                                let _ = app.emit("code-ai-reasoning-chunk", serde_json::json!({
                                    "streamId": stream_id, "token": rtok
                                }));
                            }
                        }
                        if let Some(tc_arr) = delta["tool_calls"].as_array() {
                            for tc in tc_arr {
                                let idx = tc["index"].as_u64().unwrap_or(0) as usize;
                                while tool_calls.len() <= idx {
                                    tool_calls.push(ToolCallAcc::default());
                                }
                                if let Some(id) = tc["id"].as_str() { tool_calls[idx].id = id.to_string(); }
                                if let Some(name) = tc["function"]["name"].as_str() { tool_calls[idx].name = name.to_string(); }
                                if let Some(args) = tc["function"]["arguments"].as_str() { tool_calls[idx].arguments.push_str(args); }
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

    // Emit done with parsed tool calls
    let tc_json: Vec<Value> = tool_calls.iter()
        .filter(|tc| !tc.id.is_empty() && !tc.name.is_empty())
        .map(|tc| serde_json::json!({
            "id": tc.id, "name": tc.name, "arguments": tc.arguments
        }))
        .collect();

    let _ = app.emit("code-ai-done", serde_json::json!({
        "streamId": stream_id,
        "content": content_text,
        "toolCalls": tc_json,
        "finishReason": finish_reason,
    }));

    Ok(())
}

#[derive(Default)]
struct ToolCallAcc {
    id: String,
    name: String,
    arguments: String,
}
