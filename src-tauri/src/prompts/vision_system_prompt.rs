//! System prompt for clipboard image analysis (see `commands::clipboard::analyze_image`).
//! Steers the vision model to emit ONLY a JSON object with `description` and
//! `extractedText` fields.

pub const VISION_SYSTEM_PROMPT: &str = "Analyze this image and respond with ONLY valid JSON (no markdown, no code blocks, no extra text).\n\
    The JSON must have exactly these two fields:\n\
    {\n\
      \"description\": \"Concise description for search indexing. Include: what the image shows (screenshot, photo, diagram, code, UI, chart, etc.), colors, layout, visual elements, and relevant keywords/tags. Keep under 300 words.\",\n\
      \"extractedText\": \"ALL visible text from the image exactly as it appears, preserving line breaks and structure. If no text is visible, use null.\"\n\
    }\n\
    Respond with ONLY the JSON object.";
