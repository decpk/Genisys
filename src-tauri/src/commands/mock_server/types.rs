/// Data structure for an endpoint loaded from DB, used to build the axum router.
#[derive(Clone)]
pub(crate) struct EndpointData {
    pub(crate) id: String,
    pub(crate) method: String,
    pub(crate) path: String,
    pub(crate) status_code: u16,
    pub(crate) response_headers: String,
    pub(crate) response_body: String,
    pub(crate) delay_ms: u64,
    pub(crate) variant_mode: String,
    pub(crate) variants: Vec<super::runtime::variants::VariantData>,
    // ── Dynamic AI response fields ──────────────────────────────────
    /// `"static"` (default) or `"ai"`.
    pub(crate) response_type: String,
    /// Freeform guidance appended to the AI system/user prompt.
    pub(crate) ai_prompt: String,
    /// Template describing the desired structure (with inline `//` instructions).
    pub(crate) ai_schema: String,
    /// When `> 1`, the model is asked to emit an array of this many items.
    pub(crate) ai_count: i64,
    /// `"live"` | `"cached"` | `"pool"`.
    pub(crate) ai_mode: String,
    /// TTL for `cached` mode, in milliseconds.
    pub(crate) ai_cache_ttl_ms: i64,
    /// Number of pre-generated bodies for `pool` mode.
    pub(crate) ai_pool_size: i64,
}
