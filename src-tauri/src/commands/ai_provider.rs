//! Tauri commands for managing BYOK AI provider keys (Settings → AI Providers).

use serde_json::Value;

use crate::ai_provider::{load_ai_providers, save_ai_providers, ProviderEntry};

/// Returns the configured-state of each provider WITHOUT exposing the raw API
/// keys. The frontend uses this to render the per-provider settings + to derive
/// which models are available.
#[tauri::command]
pub fn cmd_get_ai_providers() -> Value {
    let cfg = load_ai_providers();
    let describe = |e: &Option<ProviderEntry>| -> Value {
        match e {
            Some(p) if !p.api_key.trim().is_empty() => serde_json::json!({
                "configured": true,
                "baseUrl": p.base_url,
                "models": p.models,
            }),
            _ => serde_json::json!({ "configured": false }),
        }
    };
    serde_json::json!({
        "openai": describe(&cfg.openai),
        "anthropic": describe(&cfg.anthropic),
        "google": describe(&cfg.google),
        "custom": describe(&cfg.custom),
    })
}

/// Store (or replace) a provider's API key. For the `custom` provider the
/// caller also supplies the OpenAI-compatible `base_url` and its `models`.
#[tauri::command]
pub fn cmd_set_ai_provider_key(
    provider: String,
    api_key: String,
    base_url: Option<String>,
    models: Option<Vec<String>>,
) -> Value {
    let mut cfg = load_ai_providers();
    let entry = ProviderEntry {
        api_key,
        base_url,
        models: models.unwrap_or_default(),
    };
    match provider.as_str() {
        "openai" => cfg.openai = Some(entry),
        "anthropic" => cfg.anthropic = Some(entry),
        "google" => cfg.google = Some(entry),
        "custom" => cfg.custom = Some(entry),
        other => return serde_json::json!({ "success": false, "error": format!("Unknown provider: {other}") }),
    }
    match save_ai_providers(&cfg) {
        Ok(_) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}

/// Remove a provider's stored key/config.
#[tauri::command]
pub fn cmd_clear_ai_provider_key(provider: String) -> Value {
    let mut cfg = load_ai_providers();
    match provider.as_str() {
        "openai" => cfg.openai = None,
        "anthropic" => cfg.anthropic = None,
        "google" => cfg.google = None,
        "custom" => cfg.custom = None,
        other => return serde_json::json!({ "success": false, "error": format!("Unknown provider: {other}") }),
    }
    match save_ai_providers(&cfg) {
        Ok(_) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e }),
    }
}
