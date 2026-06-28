use crate::ai_provider::resolve_provider;
use serde_json::Value;
use std::time::Duration;
use tauri::Emitter;

const CONNECT_TIMEOUT_SECS: u64 = 15;
const STREAM_IDLE_TIMEOUT_SECS: u64 = 90;

/// Streaming variant of `cmd_llm_json_completion`.
///
/// Emits incremental SSE tokens to the frontend so callers can render
/// the model output progressively instead of waiting for the full response.
///
/// Events emitted:
///   - `llm-stream-chunk`  { streamId, token }
///   - `llm-stream-done`   { streamId, content }
///   - `llm-stream-error`  { streamId, error }
#[tauri::command]
pub async fn cmd_llm_stream_completion(
    app: tauri::AppHandle,
    stream_id: String,
    system_prompt: String,
    user_prompt: String,
    model: Option<String>,
) {
    if let Err(e) = run_stream(&app, &stream_id, system_prompt, user_prompt, model).await {
        let _ = app.emit(
            "llm-stream-error",
            serde_json::json!({ "streamId": stream_id, "error": e }),
        );
    }
}

async fn run_stream(
    app: &tauri::AppHandle,
    stream_id: &str,
    system_prompt: String,
    user_prompt: String,
    model: Option<String>,
) -> Result<(), String> {
    let model = model.unwrap_or_else(|| "gpt-4.1".into());

    let provider = resolve_provider(&model)?;
    let ct = provider.api_key;
    let ep = provider.base_url;

    let body = serde_json::json!({
        "model": model,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": user_prompt },
        ],
        "stream": true,
        "temperature": 0.1,
    });

    // No global timeout on SSE client — would kill long streams
    let sse_client = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(CONNECT_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("SSE client error: {e}"))?;

    let resp = sse_client
        .post(format!("{ep}/chat/completions"))
        .header("Authorization", format!("Bearer {ct}"))
        .header("Content-Type", "application/json")
        .header("User-Agent", "Genisys")
        .json(&body)
        .send()
        .await
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

    loop {
        let chunk_result =
            tokio::time::timeout(Duration::from_secs(STREAM_IDLE_TIMEOUT_SECS), stream.next())
                .await;

        match chunk_result {
            Err(_) => return Err("Response timed out.".to_string()),
            Ok(None) => break,
            Ok(Some(Err(e))) => return Err(format!("Stream error: {e}")),
            Ok(Some(Ok(bytes))) => {
                sse_buffer.push_str(&String::from_utf8_lossy(&bytes));
                while let Some(pos) = sse_buffer.find('\n') {
                    let line = sse_buffer[..pos].trim().to_string();
                    sse_buffer = sse_buffer[pos + 1..].to_string();
                    if line.is_empty() || !line.starts_with("data: ") {
                        continue;
                    }
                    let data = &line[6..];
                    if data == "[DONE]" {
                        continue;
                    }
                    if let Ok(parsed) = serde_json::from_str::<Value>(data) {
                        let delta = &parsed["choices"][0]["delta"];
                        if let Some(token) = delta["content"].as_str() {
                            content_text.push_str(token);
                            let _ = app.emit(
                                "llm-stream-chunk",
                                serde_json::json!({
                                    "streamId": stream_id,
                                    "token": token,
                                }),
                            );
                        }
                        // Reasoning channels: providers use different field names.
                        // OpenAI o-series → `reasoning_content`; Anthropic → `reasoning` or `thinking`.
                        let reasoning_token = delta["reasoning"]
                            .as_str()
                            .or_else(|| delta["reasoning_content"].as_str())
                            .or_else(|| delta["thinking"].as_str());
                        if let Some(rtok) = reasoning_token {
                            if !rtok.is_empty() {
                                let _ = app.emit(
                                    "llm-stream-reasoning-chunk",
                                    serde_json::json!({
                                        "streamId": stream_id,
                                        "token": rtok,
                                    }),
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    let _ = app.emit(
        "llm-stream-done",
        serde_json::json!({
            "streamId": stream_id,
            "content": content_text,
        }),
    );

    Ok(())
}
