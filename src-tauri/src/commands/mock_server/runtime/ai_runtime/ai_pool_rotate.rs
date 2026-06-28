use super::ai_cache::AiState;
use super::generate_ai_response::generate_ai_response;
use std::sync::atomic::Ordering;

/// `pool` mode: lazily fill a fixed-size pool of pre-generated bodies, then
/// round-robin through it.
///
/// While `pool.len() < pool_size`, each request generates one more body, pushes
/// it, and returns it. Once full, requests advance an atomic counter and return
/// `pool[counter % len]` without calling the LLM again. The pool lock is a
/// `tokio::sync::Mutex` held across the generation `.await` during the fill
/// phase so the pool never exceeds `pool_size`.
pub(crate) async fn ai_pool_rotate(
    state: &AiState,
    pool_size: usize,
    ai_prompt: &str,
    ai_schema: &str,
    ai_count: i64,
) -> Result<String, String> {
    let size = pool_size.max(1);
    let mut pool = state.pool.lock().await;

    if pool.len() < size {
        let body = generate_ai_response(ai_prompt, ai_schema, ai_count).await?;
        pool.push(body.clone());
        return Ok(body);
    }

    let idx = (state.pool_counter.fetch_add(1, Ordering::Relaxed) as usize) % pool.len();
    Ok(pool[idx].clone())
}
