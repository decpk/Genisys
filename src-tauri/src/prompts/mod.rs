//! Centralized LLM prompt definitions for the Rust backend.
//!
//! Mirrors the TypeScript `src/prompts/` directory. Each submodule owns a
//! single prompt: a `pub const NAME: &str` for static prompts or a
//! `pub fn build_...` for prompt builders. Command files reference these via
//! `use crate::prompts::<file>::<NAME>;` and keep all non-prompt logic in place.

pub mod agentic_system_prompt;
pub mod explorer_ai_system_prompt;
pub mod mock_data_prompt;
pub mod research_system_prompt;
pub mod vision_system_prompt;
pub mod vision_urls_prompt;
