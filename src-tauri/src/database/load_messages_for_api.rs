use std::path::Path;

use base64::Engine;
use serde_json::Value;

use super::Database;

/// Load messages for the LLM API. Returns the last 200 messages in ascending
/// sort_order.
///
/// For user messages that have attached images, the `content` is emitted as an
/// OpenAI-style multipart array (`[{type:"text",...}, {type:"image_url",...}]`)
/// so vision-capable models receive the images. Messages without images keep a
/// plain string `content` for backward compatibility.
///
/// `images_dir` is the directory where chat attachment images are stored
/// (`<app_data>/chat-images`). Image files are read and base64-encoded into
/// data URIs at request time.
pub fn load_messages_for_api(
    db: &Database,
    conversation_id: &str,
    images_dir: &Path,
) -> Vec<Value> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT role, content, images FROM chat_messages WHERE conversation_id = ?1 ORDER BY sort_order DESC LIMIT 200",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_messages_for_api prepare: {e}"); return vec![]; } };
    let mut msgs: Vec<Value> = stmt.query_map(rusqlite::params![conversation_id], |row| {
        let role: String = row.get(0)?;
        let content: String = row.get(1)?;
        let images_raw: Option<String> = row.get(2).ok().flatten();
        Ok((role, content, images_raw))
    })
    .map(|rows| {
        rows.filter_map(|r| r.ok())
            .map(|(role, content, images_raw)| build_message(images_dir, &role, content, images_raw))
            .collect()
    })
    .unwrap_or_default();
    msgs.reverse(); // Return in ascending order (oldest first)
    msgs
}

/// Build a single message Value, attaching images as multipart content when present.
fn build_message(images_dir: &Path, role: &str, content: String, images_raw: Option<String>) -> Value {
    let filenames: Vec<String> = images_raw
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .and_then(|s| serde_json::from_str::<Vec<String>>(s).ok())
        .unwrap_or_default();

    if filenames.is_empty() {
        return serde_json::json!({ "role": role, "content": content });
    }

    let mut parts: Vec<Value> = vec![serde_json::json!({ "type": "text", "text": content })];
    for fname in &filenames {
        if let Some(data_uri) = read_image_as_data_uri(images_dir, fname) {
            parts.push(serde_json::json!({
                "type": "image_url",
                "image_url": { "url": data_uri }
            }));
        }
    }

    // If every image failed to load, fall back to plain text content.
    if parts.len() == 1 {
        return serde_json::json!({ "role": role, "content": content });
    }

    serde_json::json!({ "role": role, "content": parts })
}

/// Read a stored chat image file and encode it as a base64 data URI.
/// Rejects filenames that contain path separators or `..`.
fn read_image_as_data_uri(images_dir: &Path, filename: &str) -> Option<String> {
    if filename.is_empty()
        || filename.contains('/')
        || filename.contains('\\')
        || filename.contains("..")
    {
        return None;
    }
    let path = images_dir.join(filename);
    let bytes = std::fs::read(&path).ok()?;
    let mime = match filename.rsplit('.').next().unwrap_or("").to_lowercase().as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        _ => "image/png",
    };
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Some(format!("data:{mime};base64,{b64}"))
}
