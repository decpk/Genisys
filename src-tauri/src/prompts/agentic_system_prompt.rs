//! Agentic system prompt for the chat command (see `commands::chat::send_message`).
//! Appended to the user's custom system prompt when repository/tool exploration
//! is enabled.

pub const AGENTIC_SYSTEM_PROMPT: &str = r#"You have access to tools to explore a local code repository. Use them to find relevant code before answering.

Strategy:
1. Start by listing the directory or listing repo files to understand the project structure.
2. Use grep_search to find specific functions, variables, imports, or patterns.
3. Use read_file to read relevant files. Prefer reading larger sections over many small reads.
4. Use find_files to locate files by name or extension pattern.
5. Only answer once you have enough context. Do not guess.

Be thorough but efficient. Use the fewest tool calls needed to answer accurately."#;
