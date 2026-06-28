//! Shared LLM client — thin wrapper around the OpenAI-compatible chat-completions
//! transport for non-window Rust callers (e.g. the Mock Server AI runtime).
//!
//! We re-implement the small POST here instead of calling the
//! `#[tauri::command]` because tauri commands cannot be invoked directly from
//! other Rust code without a window handle, and we want a synchronous-style
//! `async fn` returning a `Result<String, String>`.
//!
//! Returns the raw `content` string (typically JSON). Caller is responsible
//! for parsing.

use serde_json::Value;

use crate::ai_provider::resolve_provider;

const DEFAULT_MODEL: &str = "gpt-4.1";

/// Send a single-turn chat-completion request and return the raw assistant
/// content string. The caller is expected to parse JSON out of it (and to
/// tolerate non-JSON / malformed replies).
pub async fn llm_json_completion(
    system_prompt: &str,
    user_prompt: &str,
    model: Option<&str>,
) -> Result<String, String> {
    let model = model.unwrap_or(DEFAULT_MODEL).to_string();
    let provider = resolve_provider(&model)?;

    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": false,
        "temperature": 0.1,
    });

    let resp = client
        .post(format!("{}/chat/completions", provider.base_url))
        .header("Authorization", format!("Bearer {}", provider.api_key))
        .header("Content-Type", "application/json")
        .header("User-Agent", "Genisys")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Chat completion request failed: {e}"))?;

    if !resp.status().is_success() {
        let st = resp.status().as_u16();
        let body_text = resp.text().await.unwrap_or_default();
        return Err(format!("HTTP {st}: {body_text}"));
    }

    let data: Value = resp
        .json()
        .await
        .map_err(|e| format!("Chat completion decode failed: {e}"))?;

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    if content.is_empty() {
        return Err("Empty content in LLM response".to_string());
    }
    Ok(content)
}
