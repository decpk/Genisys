use super::ai_cache::{AiCacheEntry, AiState};
use super::generate_ai_response::generate_ai_response;
use std::time::{Duration, Instant};

/// `cached` mode: return the cached body while it is still fresh, otherwise
/// (re)generate, store it with a new `expires_at = now + ttl`, and return it.
///
/// The cache lock is a `tokio::sync::Mutex` and is held across the generation
/// `.await`, so concurrent requests during a regeneration serialize on it and
/// share the single freshly-generated body rather than each calling the LLM.
pub(crate) async fn ai_cache_get_or_set(
    state: &AiState,
    ttl_ms: u64,
    ai_prompt: &str,
    ai_schema: &str,
    ai_count: i64,
) -> Result<String, String> {
    let mut guard = state.cache.lock().await;

    if let Some(entry) = guard.as_ref() {
        if entry.expires_at > Instant::now() {
            return Ok(entry.body.clone());
        }
    }

    // Expired or never generated — produce a fresh body and cache it.
    let body = generate_ai_response(ai_prompt, ai_schema, ai_count).await?;
    *guard = Some(AiCacheEntry {
        body: body.clone(),
        expires_at: Instant::now() + Duration::from_millis(ttl_ms),
    });

    Ok(body)
}
