//! Shared serde types for the Monitor feature: the WebSocket signaling wire
//! protocol (browser <-> server), the Tauri events pushed to the desktop UI,
//! and the command response payloads.
//!
//! Monitor streams the desktop's camera + microphone to a remote browser over
//! WebRTC. The Axum WebSocket carries only the WebRTC *signaling* (SDP
//! offer/answer + ICE candidates) as opaque JSON; the actual audio/video flows
//! peer-to-peer between the desktop webview and the remote browser. JSON is
//! camelCase on the wire; the WS protocol is internally tagged via `type`.

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Messages sent by the browser client over the WebSocket (JSON text frames).
/// Only meaningful once the connection has been approved.
#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientMessage {
    /// A WebRTC signaling payload from the viewer (answer / ICE candidate). The
    /// inner `data` is opaque to the server — it is relayed verbatim to the
    /// desktop, which owns the `RTCPeerConnection`.
    Signal { data: Value },
}

/// Messages sent by the server to the browser client (JSON text frames).
#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerMessage {
    /// Awaiting desktop approval.
    Pending,
    /// Rejected by the desktop (or approval timed out).
    Denied { reason: String },
    /// A WebRTC signaling payload from the desktop (offer / ICE candidate),
    /// relayed verbatim. The viewer applies it to its `RTCPeerConnection`.
    Signal { data: Value },
    /// Issued after approval so the browser can persist a trust grant and skip
    /// the approval prompt on reconnect (page reload) until it expires. Re-sent
    /// (with a slid-forward expiry) whenever an existing grant is reused.
    #[serde(rename_all = "camelCase")]
    Granted { grant: String, expires_at: i64 },
}

/// Payload of the `monitor-approval-request` Tauri event: a new device is
/// waiting for the user to allow or deny camera + microphone access. One
/// approval grants the device a live view, so it is device-level.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApprovalRequestEvent {
    pub request_id: String,
    pub ip: String,
}

/// A connected remote viewer, surfaced in status + the clients-changed event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientInfo {
    pub client_id: String,
    pub ip: String,
    /// Unix epoch milliseconds when the device connected.
    pub connected_at: i64,
}

/// Payload of the `monitor-clients-changed` Tauri event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientsChangedEvent {
    pub clients: Vec<ClientInfo>,
}

/// Payload of the `monitor-client-connected` Tauri event: an approved viewer
/// is ready. The desktop reacts by creating a fresh `RTCPeerConnection` for this
/// `client_id`, adding its camera + mic tracks, and sending an offer back via
/// `cmd_monitor_send_signal`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientConnectedEvent {
    pub client_id: String,
    pub ip: String,
}

/// Payload of the `monitor-client-disconnected` Tauri event: a viewer's socket
/// closed. The desktop reacts by closing and dropping that client's peer
/// connection.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientDisconnectedEvent {
    pub client_id: String,
}

/// Payload of the `monitor-signal` Tauri event: a WebRTC signaling message
/// from the viewer (answer / ICE candidate), tagged with the originating
/// `client_id` so the desktop applies it to the matching peer connection.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalEvent {
    pub client_id: String,
    pub data: Value,
}

/// Returned by `cmd_monitor_start`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorStartInfo {
    pub url: String,
    pub ip: String,
    pub port: u16,
    pub token: String,
}

/// Returned by `cmd_monitor_status`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorStatus {
    pub running: bool,
    pub url: Option<String>,
    pub ip: Option<String>,
    pub port: Option<u16>,
    pub token: Option<String>,
    pub clients: Vec<ClientInfo>,
}
