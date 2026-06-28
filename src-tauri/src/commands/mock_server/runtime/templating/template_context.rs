use std::collections::HashMap;

/// Runtime context used to resolve `{{ ... }}` template tokens for a single
/// request. Built per-request in the mock router handler.
pub(crate) struct TemplateContext {
    /// Path parameters extracted from the endpoint pattern (e.g. `:id`).
    pub(crate) params: HashMap<String, String>,
    /// Query string parameters parsed from the request URI.
    pub(crate) query: HashMap<String, String>,
    /// Parsed request body, if it was valid JSON.
    pub(crate) body_json: Option<serde_json::Value>,
}
