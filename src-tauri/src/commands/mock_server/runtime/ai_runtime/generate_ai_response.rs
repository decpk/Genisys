use crate::prompts::mock_data_prompt::build_ai_prompt;

/// Generate a single AI response body at request time.
///
/// Builds the prompt via [`build_ai_prompt`], calls the reusable Rust LLM client
/// (`llm_json_completion`, which supplies its own provider credentials), and
/// strips any markdown code fences the model may add. Returns the raw body on
/// success or an `Err(message)` on failure. **Never panics** — every fallible
/// step is propagated as `Result`, so the caller can fall back to the stored
/// `response_body`.
pub(crate) async fn generate_ai_response(
    ai_prompt: &str,
    ai_schema: &str,
    ai_count: i64,
) -> Result<String, String> {
    let (system_prompt, user_prompt) = build_ai_prompt(ai_prompt, ai_schema, ai_count);

    let content =
        crate::llm_client::llm_json_completion(&system_prompt, &user_prompt, None)
            .await?;

    Ok(strip_code_fences(&content))
}

/// Strip a surrounding markdown code fence (```lang ... ```) that the LLM may
/// wrap around its output. Mirrors the frontend `stripCodeFences` so the served
/// body matches what an author previews at edit time.
fn strip_code_fences(content: &str) -> String {
    let trimmed = content.trim();
    if !trimmed.starts_with("```") {
        return trimmed.to_string();
    }

    let mut lines: Vec<&str> = trimmed.lines().collect();
    if !lines.is_empty() {
        lines.remove(0); // drop opening fence (``` optionally + lang tag)
    }
    if let Some(last) = lines.last() {
        if last.trim_start().starts_with("```") {
            lines.pop(); // drop closing fence
        }
    }
    lines.join("\n").trim().to_string()
}
