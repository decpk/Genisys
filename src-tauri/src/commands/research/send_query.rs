use crate::ai_provider::resolve_provider;
use base64::{Engine as _, engine::general_purpose};
use serde_json::Value;
use tauri::Emitter;
use std::fs;
use std::path::PathBuf;

const MAX_FILE_SIZE: u64 = 2 * 1024 * 1024; // 2MB per file
const MAX_IMAGE_SIZE: u64 = 20 * 1024 * 1024; // 20MB per image
const MAX_CONTEXT_CHARS: usize = 200_000; // ~50k tokens context budget

const IMAGE_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico"];

/// Build a research-oriented system prompt
fn build_research_system_prompt(context_chunks: &[ContextChunk]) -> String {
    let mut prompt = String::from(crate::prompts::research_system_prompt::RESEARCH_SYSTEM_PROMPT_HEADER);

    for chunk in context_chunks {
        prompt.push_str(&format!(
            "\n--- Source: {} (lines {}-{}) ---\n{}\n",
            chunk.file_path, chunk.start_line, chunk.end_line, chunk.content
        ));
    }

    prompt
}

struct ContextChunk {
    file_path: String,
    start_line: usize,
    end_line: usize,
    content: String,
}

/// Chunk a file into segments by logical boundaries
fn chunk_file(file_path: &str, content: &str) -> Vec<ContextChunk> {
    let lines: Vec<&str> = content.lines().collect();
    if lines.is_empty() {
        return vec![];
    }

    let ext = file_path.rsplit('.').next().unwrap_or("");
    let is_code = matches!(
        ext,
        "ts" | "tsx" | "js" | "jsx" | "py" | "rs" | "go" | "java" | "c" | "cpp" | "cs"
        | "rb" | "php" | "swift" | "kt" | "dart" | "lua" | "r" | "scala"
    );
    let is_markdown = matches!(ext, "md" | "mdx" | "markdown");

    let max_chunk_lines = if is_code { 80 } else { 60 };
    let mut chunks = Vec::new();
    let mut chunk_start = 0;

    for (i, line) in lines.iter().enumerate() {
        let is_boundary = if is_markdown {
            line.starts_with("# ") || line.starts_with("## ") || line.starts_with("### ")
        } else if is_code {
            // Function/class boundaries
            let trimmed = line.trim();
            trimmed.starts_with("fn ") || trimmed.starts_with("pub fn ")
                || trimmed.starts_with("function ") || trimmed.starts_with("export function ")
                || trimmed.starts_with("async function ") || trimmed.starts_with("export async function ")
                || trimmed.starts_with("def ") || trimmed.starts_with("class ")
                || trimmed.starts_with("export class ") || trimmed.starts_with("export default ")
                || trimmed.starts_with("impl ")
                || (trimmed.starts_with("const ") && trimmed.contains(" = ") && i > chunk_start + 5)
        } else {
            line.is_empty() && i > chunk_start + 10
        };

        let chunk_too_long = i - chunk_start >= max_chunk_lines;

        if (is_boundary || chunk_too_long) && i > chunk_start {
            let chunk_content: String = lines[chunk_start..i].join("\n");
            if !chunk_content.trim().is_empty() {
                chunks.push(ContextChunk {
                    file_path: file_path.to_string(),
                    start_line: chunk_start + 1,
                    end_line: i,
                    content: chunk_content,
                });
            }
            chunk_start = i;
        }
    }

    // Final chunk
    if chunk_start < lines.len() {
        let chunk_content: String = lines[chunk_start..].join("\n");
        if !chunk_content.trim().is_empty() {
            chunks.push(ContextChunk {
                file_path: file_path.to_string(),
                start_line: chunk_start + 1,
                end_line: lines.len(),
                content: chunk_content,
            });
        }
    }

    chunks
}

/// Simple TF-IDF-like relevance scoring
fn score_chunk(chunk: &ContextChunk, query_terms: &[String]) -> f64 {
    let content_lower = chunk.content.to_lowercase();
    let mut score = 0.0;

    for term in query_terms {
        let count = content_lower.matches(term.as_str()).count();
        if count > 0 {
            // Log-based TF * IDF-like boost for rarer terms
            score += (1.0 + (count as f64).ln()) * (1.0 / (term.len().max(1) as f64).sqrt());
        }
    }

    // Boost for file path match
    let path_lower = chunk.file_path.to_lowercase();
    for term in query_terms {
        if path_lower.contains(term.as_str()) {
            score += 2.0;
        }
    }

    score
}

/// Tokenize query into search terms
fn tokenize_query(query: &str) -> Vec<String> {
    query
        .to_lowercase()
        .split(|c: char| !c.is_alphanumeric() && c != '_' && c != '-')
        .filter(|w| w.len() > 2)
        .map(String::from)
        .collect()
}

/// Read file content, respecting size limits
fn read_source_file(path: &str) -> Option<String> {
    let p = PathBuf::from(path);
    match fs::metadata(&p) {
        Ok(meta) if meta.len() > MAX_FILE_SIZE => None,
        Ok(_) => fs::read_to_string(&p).ok(),
        Err(_) => None,
    }
}

/// Check if a file path is an image based on extension
fn is_image_file(path: &str) -> bool {
    let ext = path.rsplit('.').next().unwrap_or("").to_lowercase();
    IMAGE_EXTENSIONS.contains(&ext.as_str())
}

/// Get MIME type for an image extension
fn image_mime_type(path: &str) -> &'static str {
    let ext = path.rsplit('.').next().unwrap_or("").to_lowercase();
    match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "ico" => "image/x-icon",
        _ => "application/octet-stream",
    }
}

/// Read an image file and return a base64 data URI
fn read_image_as_data_uri(path: &str) -> Option<String> {
    let p = PathBuf::from(path);
    match fs::metadata(&p) {
        Ok(meta) if meta.len() > MAX_IMAGE_SIZE => None,
        Ok(_) => {
            let bytes = fs::read(&p).ok()?;
            let b64 = general_purpose::STANDARD.encode(&bytes);
            let mime = image_mime_type(path);
            Some(format!("data:{};base64,{}", mime, b64))
        }
        Err(_) => None,
    }
}

/// Recursively list files in a repo directory (respects .gitignore patterns)
fn list_repo_files(root: &str) -> Vec<String> {
    let root_path = PathBuf::from(root);
    crate::file_walker::collect_repo_files(&root_path)
}

#[tauri::command]
pub async fn cmd_research_send_query(
    app: tauri::AppHandle,
    stream_id: String,
    session_id: String,
    query: String,
    sources: Vec<Value>,
    model: Option<String>,
) {
    let model = model.unwrap_or_else(|| "gpt-4.1".into());

    let (ct, ep) = match resolve_provider(&model) {
        Ok(p) => (p.api_key, p.base_url),
        Err(e) => {
            let _ = app.emit("research-stream-error", serde_json::json!({"streamId":stream_id,"error":e}));
            return;
        }
    };

    // 1. Gather all source file contents
    let mut all_chunks: Vec<ContextChunk> = Vec::new();
    let mut image_data_uris: Vec<(String, String)> = Vec::new(); // (name, data_uri)

    for source in &sources {
        let source_type = source["sourceType"].as_str().unwrap_or("");
        let path = source["path"].as_str().unwrap_or("");
        let name = source["name"].as_str().unwrap_or("");

        match source_type {
            "file" => {
                if is_image_file(path) {
                    if let Some(data_uri) = read_image_as_data_uri(path) {
                        let display_name = path.rsplit('/').next().unwrap_or(path);
                        image_data_uris.push((display_name.to_string(), data_uri));
                    }
                } else if let Some(content) = read_source_file(path) {
                    let display_name = path.rsplit('/').next().unwrap_or(path);
                    all_chunks.extend(chunk_file(display_name, &content));
                }
            }
            "repo" => {
                let files = list_repo_files(path);
                for file_rel in files.iter().take(500) { // Cap at 500 files
                    let full = PathBuf::from(path).join(file_rel);
                    if let Some(content) = read_source_file(&full.to_string_lossy()) {
                        let display_path = format!("{}/{}", name, file_rel);
                        all_chunks.extend(chunk_file(&display_path, &content));
                    }
                }
            }
            "raw" => {
                // For raw sources, path contains the content
                all_chunks.push(ContextChunk {
                    file_path: name.to_string(),
                    start_line: 1,
                    end_line: path.lines().count().max(1),
                    content: path.to_string(),
                });
            }
            _ => {}
        }
    }

    // 2. Score and rank chunks by relevance to the query
    let query_terms = tokenize_query(&query);

    if !query_terms.is_empty() && !all_chunks.is_empty() {
        // Score each chunk
        let mut scored: Vec<(f64, usize)> = all_chunks
            .iter()
            .enumerate()
            .map(|(i, chunk)| (score_chunk(chunk, &query_terms), i))
            .collect();

        // Sort by score descending
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

        // Select top chunks within context budget
        let mut selected_indices: Vec<usize> = Vec::new();
        let mut total_chars = 0;
        for (score, idx) in &scored {
            if *score <= 0.0 && selected_indices.len() >= 20 {
                break; // Include at least 20 chunks even if low-scoring
            }
            let chunk_chars = all_chunks[*idx].content.len();
            if total_chars + chunk_chars > MAX_CONTEXT_CHARS && !selected_indices.is_empty() {
                break;
            }
            selected_indices.push(*idx);
            total_chars += chunk_chars;
        }

        // Sort by original order for coherence
        selected_indices.sort();

        let selected_chunks: Vec<ContextChunk> = selected_indices
            .into_iter()
            .map(|i| {
                let c = &all_chunks[i];
                ContextChunk {
                    file_path: c.file_path.clone(),
                    start_line: c.start_line,
                    end_line: c.end_line,
                    content: c.content.clone(),
                }
            })
            .collect();

        all_chunks = selected_chunks;
    } else if all_chunks.len() > 50 {
        // No query terms — just take first 50 chunks
        all_chunks.truncate(50);
    }

    // 3. Build system prompt with context
    let system_prompt = build_research_system_prompt(&all_chunks);

    // 4. Build messages (no persisted history — Chat passes its own conversation context
    //    via the system prompt / source material). The session_id is retained only for
    //    correlating stream events on the frontend.
    let _ = &session_id;
    let messages = {
        let mut msgs: Vec<Value> = vec![
            serde_json::json!({"role": "system", "content": system_prompt}),
        ];

        // Build the user message — multipart if images are attached
        if !image_data_uris.is_empty() {
            let mut content_parts: Vec<Value> = Vec::new();
            content_parts.push(serde_json::json!({
                "type": "text",
                "text": query
            }));
            for (_name, data_uri) in &image_data_uris {
                content_parts.push(serde_json::json!({
                    "type": "image_url",
                    "image_url": { "url": data_uri }
                }));
            }
            msgs.push(serde_json::json!({"role": "user", "content": content_parts}));
        } else {
            // Ensure the current query is always included as the final user message
            if msgs.last().and_then(|m| m["role"].as_str()) != Some("user")
                || msgs.last().and_then(|m| m["content"].as_str()) != Some(&query)
            {
                msgs.push(serde_json::json!({"role": "user", "content": query}));
            }
        }
        msgs
    };

    // 5. Stream from the configured AI provider (same pattern as chat)
    let client = reqwest::Client::new();

    let resp = match client.post(format!("{ep}/chat/completions"))
        .header("Authorization", format!("Bearer {ct}"))
        .header("Content-Type", "application/json")
        .header("User-Agent", "Genisys")
        .json(&serde_json::json!({"model": model, "messages": messages, "stream": true}))
        .send().await
    {
        Ok(r) => r,
        Err(e) => {
            let _ = app.emit("research-stream-error", serde_json::json!({"streamId":stream_id,"error":e.to_string()}));
            return;
        }
    };

    if !resp.status().is_success() {
        let st = resp.status().as_u16();
        let body = resp.text().await.unwrap_or_default();
        let _ = app.emit("research-stream-error", serde_json::json!({"streamId":stream_id,"error":format!("HTTP {st}: {body}")}));
        return;
    }

    // 6. Stream SSE response
    use futures_util::StreamExt;
    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                buffer.push_str(&String::from_utf8_lossy(&bytes));
                while let Some(pos) = buffer.find('\n') {
                    let line = buffer[..pos].trim().to_string();
                    buffer = buffer[pos + 1..].to_string();
                    if line.is_empty() || !line.starts_with("data: ") { continue; }
                    let data = &line[6..];
                    if data == "[DONE]" { continue; }
                    if let Ok(parsed) = serde_json::from_str::<Value>(data) {
                        if let Some(token) = parsed["choices"][0]["delta"]["content"].as_str() {
                            let _ = app.emit("research-stream-chunk", serde_json::json!({"streamId":stream_id,"token":token}));
                        }
                    }
                }
            }
            Err(e) => {
                let _ = app.emit("research-stream-error", serde_json::json!({"streamId":stream_id,"error":e.to_string()}));
                return;
            }
        }
    }

    let _ = app.emit("research-stream-done", serde_json::json!({"streamId":stream_id}));
}
