use std::sync::atomic::AtomicU64;
use std::time::Instant;
use tokio::sync::Mutex;

/// A cached AI response body together with its expiry instant (mode `cached`).
pub(crate) struct AiCacheEntry {
    pub(crate) body: String,
    pub(crate) expires_at: Instant,
}

/// Per-endpoint AI runtime state, shared across all requests to one route.
///
/// One `Arc<AiState>` is created at router-build time and cloned into the
/// handler closure (mirroring the variants sequence-counter capture pattern).
/// Async-safe locks (`tokio::sync::Mutex`) are used because the cache/pool are
/// accessed across `.await` points while generating responses.
pub(crate) struct AiState {
    /// `cached` mode: the most recently generated body and its TTL deadline.
    pub(crate) cache: Mutex<Option<AiCacheEntry>>,
    /// `pool` mode: lazily filled set of pre-generated bodies.
    pub(crate) pool: Mutex<Vec<String>>,
    /// `pool` mode: round-robin index advanced once the pool is full.
    pub(crate) pool_counter: AtomicU64,
}

impl AiState {
    pub(crate) fn new() -> Self {
        Self {
            cache: Mutex::new(None),
            pool: Mutex::new(Vec::new()),
            pool_counter: AtomicU64::new(0),
        }
    }
}
