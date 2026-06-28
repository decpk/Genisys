use std::collections::HashMap;

/// Per-request inputs used by conditional variant matching.
pub(crate) struct VariantRequestCtx {
    pub(crate) query: HashMap<String, String>,
    pub(crate) headers: HashMap<String, String>,
    pub(crate) body_json: Option<serde_json::Value>,
}
