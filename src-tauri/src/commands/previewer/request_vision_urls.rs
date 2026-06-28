use crate::ai_provider::resolve_provider;
use crate::prompts::vision_urls_prompt::VISION_PROMPT;
use serde_json::Value;

/// Resolve the configured provider, POST the prepared JPEG data-URL to
/// `{endpoint}/chat/completions`, and return the de-duplicated list of absolute
/// http(s) URLs the model identified.
///
/// Mirrors the clipboard vision request shape. No `unwrap`/`expect` on the
/// command path.
pub(super) async fn request_vision_urls(data_url: &str, model: &str) -> Result<Vec<String>, String> {
    let provider = resolve_provider(model)?;
    let ct = provider.api_key;
    let ep = provider.base_url;

    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_PROMPT},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ],
        "stream": false,
        "temperature": 0.1,
        "max_tokens": 1000,
    });

    let resp = client
        .post(format!("{ep}/chat/completions"))
        .header("Authorization", format!("Bearer {ct}"))
        .header("Content-Type", "application/json")
        .header("User-Agent", "Genisys")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = resp.status();
    if !status.is_success() {
        let st = status.as_u16();
        let body_text = resp.text().await.unwrap_or_default();
        return Err(format!("HTTP {st}: {body_text}"));
    }

    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();
    if content.is_empty() {
        return Err("Empty response from vision model.".to_string());
    }

    parse_url_list(&content)
}

/// Strip markdown code fences / surrounding prose, parse the JSON array of URL
/// strings, then keep only trimmed absolute http(s) entries with order-preserving
/// de-duplication. A genuine JSON parse failure surfaces as an `Err`.
fn parse_url_list(raw: &str) -> Result<Vec<String>, String> {
    let trimmed = raw.trim();
    let inner = trimmed
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    // Fall back to the outermost [...] slice when the model wrapped the array
    // in extra prose despite the prompt.
    let slice = match (inner.find('['), inner.rfind(']')) {
        (Some(start), Some(end)) if end > start => &inner[start..=end],
        _ => inner,
    };

    let parsed: Vec<String> = serde_json::from_str(slice)
        .map_err(|e| format!("Failed to parse model response: {e}"))?;

    let mut out: Vec<String> = Vec::new();
    for entry in parsed {
        let url = entry.trim().to_string();
        let is_abs = url.starts_with("http://") || url.starts_with("https://");
        if is_abs && !out.contains(&url) {
            out.push(url);
        }
    }
    Ok(out)
}
