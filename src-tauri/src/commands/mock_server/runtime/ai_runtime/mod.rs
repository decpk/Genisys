//! Request-time AI response generation for mock endpoints whose
//! `response_type == "ai"`. Supports three per-endpoint modes:
//! - `live`   — generate a fresh body on every request.
//! - `cached` — generate once, reuse until a TTL elapses.
//! - `pool`   — lazily fill a fixed-size pool, then round-robin through it.
//!
//! One function per file. The reusable Rust LLM client
//! (`crate::llm_client::llm_json_completion`) supplies its own
//! provider credentials internally, so no `AppHandle`/config threading is needed.

mod ai_cache;
mod ai_cache_get_or_set;
mod ai_pool_rotate;
mod generate_ai_response;

pub(crate) use ai_cache::AiState;
pub(crate) use ai_cache_get_or_set::ai_cache_get_or_set;
pub(crate) use ai_pool_rotate::ai_pool_rotate;
pub(crate) use generate_ai_response::generate_ai_response;
