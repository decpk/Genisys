//! BYOK (Bring-Your-Own-Key) AI provider configuration + resolution.
//!
//! Users supply their own API keys for OpenAI, Anthropic, Google (Gemini), or a
//! custom OpenAI-compatible endpoint (Ollama / OpenRouter / LM Studio / …).
//! Every provider is spoken to via the OpenAI-compatible `/chat/completions`
//! (+ `/models`) shape, so resolution simply yields a base URL + API key; the
//! existing request/SSE/tool-parsing code is reused unchanged.
//!
//! Config is stored as plain JSON at `<data-dir>/ai-providers.json`.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::helpers::{ensure_data_dir, get_data_dir};

/// A single provider's stored configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProviderEntry {
    #[serde(default)]
    pub api_key: String,
    /// Only meaningful for the `custom` provider: its OpenAI-compatible base URL.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub base_url: Option<String>,
    /// Only meaningful for the `custom` provider: the model ids it serves
    /// (used both for the model picker and for provider routing).
    #[serde(default)]
    pub models: Vec<String>,
}

/// The full BYOK provider config.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AiProviders {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub openai: Option<ProviderEntry>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub anthropic: Option<ProviderEntry>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub google: Option<ProviderEntry>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub custom: Option<ProviderEntry>,
}

/// The result of resolving a model id to a concrete endpoint + credential.
pub struct ResolvedProvider {
    pub base_url: String,
    pub api_key: String,
}

const OPENAI_BASE: &str = "https://api.openai.com/v1";
const ANTHROPIC_BASE: &str = "https://api.anthropic.com/v1";
const GOOGLE_BASE: &str = "https://generativelanguage.googleapis.com/v1beta/openai";

fn providers_path() -> PathBuf {
    get_data_dir().join("ai-providers.json")
}

/// Load the stored provider config (empty default if absent / unparseable).
pub fn load_ai_providers() -> AiProviders {
    match fs::read_to_string(providers_path()) {
        Ok(s) => serde_json::from_str(&s).unwrap_or_default(),
        Err(_) => AiProviders::default(),
    }
}

/// Persist the provider config to disk.
pub fn save_ai_providers(p: &AiProviders) -> Result<(), String> {
    ensure_data_dir();
    let s = serde_json::to_string_pretty(p).map_err(|e| e.to_string())?;
    fs::write(providers_path(), s).map_err(|e| e.to_string())
}

/// Which provider id serves a given model id. The custom provider wins when the
/// model is in its explicit list; otherwise route by id prefix.
pub fn provider_for_model(model: &str, cfg: &AiProviders) -> &'static str {
    if let Some(c) = &cfg.custom {
        if c.models.iter().any(|m| m == model) {
            return "custom";
        }
    }
    let m = model.to_ascii_lowercase();
    if m.starts_with("claude") {
        "anthropic"
    } else if m.starts_with("gemini") {
        "google"
    } else {
        "openai"
    }
}

/// Resolve a model id to `{ base_url, api_key }` using the stored BYOK config.
/// Returns a user-facing error when no key is configured for the target
/// provider (or the custom base URL is missing).
pub fn resolve_provider(model: &str) -> Result<ResolvedProvider, String> {
    let cfg = load_ai_providers();
    let id = provider_for_model(model, &cfg);

    let (entry, default_base): (Option<&ProviderEntry>, &str) = match id {
        "anthropic" => (cfg.anthropic.as_ref(), ANTHROPIC_BASE),
        "google" => (cfg.google.as_ref(), GOOGLE_BASE),
        "custom" => (cfg.custom.as_ref(), ""),
        _ => (cfg.openai.as_ref(), OPENAI_BASE),
    };

    let entry = entry.filter(|e| !e.api_key.trim().is_empty()).ok_or_else(|| {
        format!("No API key configured for {id}. Add one in Settings → AI Providers.")
    })?;

    let base_url = if id == "custom" {
        let base = entry.base_url.clone().unwrap_or_default();
        if base.trim().is_empty() {
            return Err(
                "Custom provider base URL is not set. Add it in Settings → AI Providers.".to_string(),
            );
        }
        base.trim().trim_end_matches('/').to_string()
    } else {
        default_base.to_string()
    };

    Ok(ResolvedProvider {
        base_url,
        api_key: entry.api_key.clone(),
    })
}
