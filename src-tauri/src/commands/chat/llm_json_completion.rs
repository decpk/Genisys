use crate::ai_provider::resolve_provider;
use serde_json::Value;

#[tauri::command]
pub async fn cmd_llm_json_completion(
    system_prompt: String,
    user_prompt: String,
    model: Option<String>,
) -> Value {
    let client = reqwest::Client::new();
    let model = model.unwrap_or_else(|| "gpt-4.1".into());

    let provider = match resolve_provider(&model) {
        Ok(p) => p,
        Err(e) => return serde_json::json!({"success": false, "error": e}),
    };
    let ct = provider.api_key;
    let ep = provider.base_url;

    let body = serde_json::json!({
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": false,
        "temperature": 0.1,
    });

    let resp = match client
        .post(format!("{ep}/chat/completions"))
        .header("Authorization", format!("Bearer {ct}"))
        .header("Content-Type", "application/json")
        .header("User-Agent", "Genisys")
        .json(&body)
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) => return serde_json::json!({"success": false, "error": e.to_string()}),
    };

    if !resp.status().is_success() {
        let st = resp.status().as_u16();
        let body_text = resp.text().await.unwrap_or_default();
        return serde_json::json!({"success": false, "error": format!("HTTP {st}: {body_text}")});
    }

    let data: Value = match resp.json().await {
        Ok(d) => d,
        Err(e) => return serde_json::json!({"success": false, "error": e.to_string()}),
    };

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    serde_json::json!({"success": true, "content": content})
}
