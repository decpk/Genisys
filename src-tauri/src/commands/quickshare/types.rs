//! Shared serde types for QuickShare: the WebSocket wire protocol
//! (browser <-> server), the Tauri events pushed to the desktop UI, and the
//! command/response payloads.
//!
//! QuickShare is a LAN "drop hub": the desktop runs an HTTP + WebSocket server;
//! any device that scans the QR uploads/downloads files over HTTP and shares a
//! live "tray" (files + text snippets) over the WebSocket. JSON is camelCase on
//! the wire; the WS protocol is internally tagged via `type`.

use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Reserved sender id for items shared by the desktop host itself.
pub const HOST_SENDER_ID: &str = "__host__";
/// `target` value meaning "visible to (and downloadable by) every device".
pub const TARGET_EVERYONE: &str = "everyone";

/// Normalize a client-supplied recipient into a canonical `target`: an empty /
/// missing value (or the literal "everyone") means broadcast to all.
pub fn normalize_target(raw: &str) -> String {
    let t = raw.trim();
    if t.is_empty() || t == TARGET_EVERYONE {
        TARGET_EVERYONE.to_string()
    } else {
        t.to_string()
    }
}

/// Messages sent by the browser client over the WebSocket (JSON text frames).
#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientMessage {
    /// Share a text snippet / link. `target` is a recipient device id, or
    /// "everyone" (the default when omitted).
    #[serde(rename_all = "camelCase")]
    SendText {
        text: String,
        #[serde(default)]
        target: String,
    },
    /// Relay an opaque WebRTC signaling blob (SDP offer/answer or ICE candidate)
    /// to one device, to set up a direct peer-to-peer transfer that bypasses the
    /// hub. The server only forwards it; the payload is understood solely by the
    /// two browser peers.
    #[serde(rename_all = "camelCase")]
    Signal {
        /// Stable device id of the intended recipient.
        to: String,
        /// Opaque signaling payload (offer / answer / ICE candidate).
        data: serde_json::Value,
    },
}

/// Messages sent by the server to the browser client (JSON text frames).
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerMessage {
    /// First frame after connect: this client's id plus the current tray + peers.
    #[serde(rename_all = "camelCase")]
    Welcome {
        self_id: String,
        items: Vec<TrayItem>,
        clients: Vec<ClientInfo>,
    },
    /// The shared tray changed (item added or removed).
    Tray { items: Vec<TrayItem> },
    /// The connected-peer list changed.
    Clients { clients: Vec<ClientInfo> },
    /// A WebRTC signaling blob relayed from a peer device (the counterpart of
    /// the client's `Signal`), used to negotiate a direct peer-to-peer transfer.
    #[serde(rename_all = "camelCase")]
    Signal {
        /// Stable device id of the sending peer.
        from: String,
        /// Opaque signaling payload (offer / answer / ICE candidate).
        data: serde_json::Value,
    },
}

/// One entry in the shared tray: a file (bytes live on the desktop disk at
/// `local_path`, never sent to clients) or an inline text snippet.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrayItem {
    pub id: String,
    /// "file" | "text".
    pub kind: String,
    pub name: String,
    pub size: u64,
    pub mime: String,
    pub sender_label: String,
    /// Stable id of the sending device (browser deviceId, or `__host__` for the
    /// desktop). Used to scope visibility — the sender always sees their item.
    pub sender_id: String,
    /// Recipient: a device id, or "everyone". Only the sender, the targeted
    /// device, and the desktop host can see/download a targeted item.
    pub target: String,
    pub created_at: i64,
    /// Present for text snippets only.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    /// Absolute path of the file on the desktop disk. Desktop-only — never
    /// serialized to the browser/wire (no filesystem-path leakage).
    #[serde(skip)]
    pub local_path: Option<String>,
}

impl TrayItem {
    /// Whether the device with the given stable id may see/download this item:
    /// items addressed to everyone, addressed to this device, or sent by it.
    /// (The desktop host is handled separately and always sees every item.)
    pub fn visible_to(&self, device_id: &str) -> bool {
        if self.target == TARGET_EVERYONE {
            return true;
        }
        !device_id.is_empty() && (self.target == device_id || self.sender_id == device_id)
    }

    /// Build a file item. `local_path` is the absolute path whose bytes the
    /// download route streams; it is never exposed to clients.
    pub fn new_file(
        name: String,
        size: u64,
        mime: String,
        sender_label: String,
        sender_id: String,
        target: String,
        local_path: String,
    ) -> Self {
        TrayItem {
            id: Uuid::new_v4().to_string(),
            kind: "file".to_string(),
            name,
            size,
            mime,
            sender_label,
            sender_id,
            target: normalize_target(&target),
            created_at: Utc::now().timestamp_millis(),
            text: None,
            local_path: Some(local_path),
        }
    }

    /// Build an inline text snippet item. The display `name` is a short preview
    /// of the first non-empty line.
    pub fn new_text(text: String, sender_label: String, sender_id: String, target: String) -> Self {
        let name = text_preview(&text);
        let size = text.len() as u64;
        TrayItem {
            id: Uuid::new_v4().to_string(),
            kind: "text".to_string(),
            name,
            size,
            mime: "text/plain".to_string(),
            sender_label,
            sender_id,
            target: normalize_target(&target),
            created_at: Utc::now().timestamp_millis(),
            text: Some(text),
            local_path: None,
        }
    }
}

/// A short, single-line preview used as the display name of a text snippet.
fn text_preview(text: &str) -> String {
    let first_line = text
        .lines()
        .find(|l| !l.trim().is_empty())
        .unwrap_or("")
        .trim();
    if first_line.is_empty() {
        return "Text snippet".to_string();
    }
    let max = 60;
    if first_line.chars().count() > max {
        let truncated: String = first_line.chars().take(max).collect();
        format!("{truncated}…")
    } else {
        first_line.to_string()
    }
}

/// A connected device, surfaced in status + the clients-changed event/message.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientInfo {
    /// Per-connection id (one per open socket) — used to manage/close the socket.
    pub client_id: String,
    /// Stable id of the physical device (browser-generated, persisted in
    /// localStorage). Recipient targeting and visibility key off this, so it
    /// survives reconnects. Multiple tabs of one device share it.
    pub device_id: String,
    /// Friendly device name shown in the recipient picker (e.g. "iPhone").
    pub name: String,
    pub ip: String,
    /// Unix epoch milliseconds when the device connected.
    pub connected_at: i64,
}

/// Payload of the `quickshare-tray-changed` Tauri event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrayChangedEvent {
    pub items: Vec<TrayItem>,
}

/// Payload of the `quickshare-clients-changed` Tauri event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientsChangedEvent {
    pub clients: Vec<ClientInfo>,
}

/// Returned by `cmd_quickshare_start`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuickShareStartInfo {
    pub url: String,
    pub ip: String,
    pub port: u16,
    pub token: String,
    pub storage_dir: String,
}

/// Returned by `cmd_quickshare_status`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuickShareStatus {
    pub running: bool,
    pub url: Option<String>,
    pub ip: Option<String>,
    pub port: Option<u16>,
    pub token: Option<String>,
    pub storage_dir: Option<String>,
    pub clients: Vec<ClientInfo>,
    pub items: Vec<TrayItem>,
}
