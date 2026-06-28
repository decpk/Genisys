//! Prompt builder for request-time mock-data AI generation (see
//! `commands::mock_server::runtime::ai_runtime::generate_ai_response`).

/// Build the `(system_prompt, user_prompt)` pair for request-time AI generation.
///
/// This mirrors the prompt construction used by the frontend `AIResponseTab`
/// (the "Generate" button) so a running server produces bodies consistent with
/// what an author previews at edit time:
/// - `ai_schema` is the *template* describing the desired structure. Inline
///   comments (`//` or `<!-- -->`) are treated as instructions, not output.
/// - `ai_prompt` is optional freeform guidance appended to the system prompt and
///   used as the user prompt.
/// - `ai_count` (> 1) asks the model to emit an array of that many items.
pub fn build_ai_prompt(
    ai_prompt: &str,
    ai_schema: &str,
    ai_count: i64,
) -> (String, String) {
    let additional = if ai_prompt.trim().is_empty() {
        String::new()
    } else {
        format!("Additional instructions: {ai_prompt}")
    };

    let count_instruction = if ai_count > 1 {
        format!("Generate an array of exactly {ai_count} items.")
    } else {
        String::new()
    };

    let system_prompt = format!(
        "You are a mock data generator. Generate data matching the exact structure of the template below.\n\n\
Comments (// or <!-- -->) are instructions and constraints — do NOT include them in the output.\n\
Preserve the exact format (JSON, HTML, XML, etc.) of the template.\n\
Only output the generated data, nothing else.\n\
Do NOT wrap the output in markdown code fences (```). Return the raw data only.\n\n\
Template:\n{ai_schema}\n\n{additional}\n{count_instruction}"
    );

    let user_prompt = if ai_prompt.trim().is_empty() {
        "Generate realistic mock data matching the template.".to_string()
    } else {
        ai_prompt.to_string()
    };

    (system_prompt, user_prompt)
}
