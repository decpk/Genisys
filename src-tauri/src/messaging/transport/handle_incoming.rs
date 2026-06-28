//! Decode an incoming WireMessage and emit the appropriate frontend event.

use base64::{engine::general_purpose::STANDARD, Engine};
use tauri::{AppHandle, Emitter};

use crate::messaging::types::{MsgEnvelope, WireMessage, MAX_IMAGE_SIZE};

/// Parses decrypted bytes as a `WireMessage` and emits `msg-message` (for text
/// and image) or `msg-typing`. Oversized images are rejected with `msg-error`.
/// Never logs plaintext contents.
pub async fn handle_incoming(app: &AppHandle, peer_id: &str, bytes: &[u8]) {
    let msg: WireMessage = match serde_json::from_slice(bytes) {
        Ok(m) => m,
        Err(e) => {
            let _ = app.emit(
                "msg-error",
                serde_json::json!({ "peerId": peer_id, "error": format!("malformed message: {e}") }),
            );
            return;
        }
    };

    match msg.kind.as_str() {
        "typing" => {
            let _ = app.emit(
                "msg-typing",
                serde_json::json!({ "peerId": peer_id, "isTyping": msg.is_typing.unwrap_or(false) }),
            );
        }
        "image" => {
            let data = msg.image_base64.clone().unwrap_or_default();
            match STANDARD.decode(&data) {
                Ok(decoded) if decoded.len() > MAX_IMAGE_SIZE => {
                    let _ = app.emit(
                        "msg-error",
                        serde_json::json!({ "peerId": peer_id, "error": "received image exceeds 10 MB" }),
                    );
                }
                Ok(_) => emit_envelope(app, peer_id, "image", msg),
                Err(_) => {
                    let _ = app.emit(
                        "msg-error",
                        serde_json::json!({ "peerId": peer_id, "error": "received image is not valid base64" }),
                    );
                }
            }
        }
        "signal" => {
            let _ = app.emit(
                "msg-signal",
                serde_json::json!({ "peerId": peer_id, "payload": msg.signal.clone().unwrap_or_default() }),
            );
        }
        "control" => {
            let _ = app.emit(
                "msg-control",
                serde_json::json!({ "peerId": peer_id, "payload": msg.control.clone().unwrap_or_default() }),
            );
        }
        _ => emit_envelope(app, peer_id, "text", msg),
    }
}

fn emit_envelope(app: &AppHandle, peer_id: &str, kind: &str, msg: WireMessage) {
    let envelope = MsgEnvelope {
        id: uuid::Uuid::new_v4().to_string(),
        peer_id: peer_id.to_string(),
        direction: "incoming".to_string(),
        kind: kind.to_string(),
        text: msg.text,
        image_base64: msg.image_base64,
        mime_type: msg.mime_type,
        file_name: msg.file_name,
        timestamp: chrono::Utc::now().timestamp_millis(),
    };
    let _ = app.emit("msg-message", &envelope);
}
