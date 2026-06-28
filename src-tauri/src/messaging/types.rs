//! Shared types & constants for the Messages app (P2P E2E-encrypted LAN messaging).

use serde::{Deserialize, Serialize};
use snow::TransportState;
use tokio::sync::mpsc::UnboundedSender;
use tokio::task::JoinHandle;

/// Noise handshake pattern: XX = mutual auth + forward secrecy, no pre-shared keys.
pub const NOISE_PATTERN: &str = "Noise_XX_25519_ChaChaPoly_BLAKE2s";
/// mDNS service type used for LAN discovery.
pub const SERVICE_TYPE: &str = "_genisys-msg._tcp.local.";
/// Preferred listener port (falls back to an ephemeral port when taken).
pub const DEFAULT_PORT: u16 = 47820;
/// Hard cap on a single wire frame (ciphertext) to prevent memory-exhaustion DoS.
pub const MAX_FRAME_SIZE: usize = 16 * 1024 * 1024;
/// Hard cap on a decoded image payload (10 MB).
pub const MAX_IMAGE_SIZE: usize = 10 * 1024 * 1024;
/// Hard cap on a reassembled logical message (Hello / WireMessage JSON).
pub const MAX_LOGICAL_MESSAGE: usize = 15 * 1024 * 1024;
/// Max plaintext per Noise transport message (65535 − 16-byte AEAD tag).
pub const NOISE_MAX_PAYLOAD: usize = 65519;

/// Local identity returned to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MsgIdentity {
    pub public_key: String,
    pub fingerprint: String,
    pub display_name: String,
    pub listen_port: u16,
    /// Primary LAN IPv4 of this machine (best-effort) so the user can share
    /// `local_ip:listen_port` with a peer for the manual connect flow. `None`
    /// when it cannot be determined.
    pub local_ip: Option<String>,
    /// When `true` the user is invisible: not advertising on mDNS, not
    /// browsing, and not accepting new inbound connections. Persisted so the
    /// app relaunches in the same state.
    pub offline: bool,
}

/// A remote peer (discovered and/or connected).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MsgPeer {
    pub id: String,
    pub public_key: String,
    pub display_name: String,
    pub host: String,
    pub port: u16,
    pub status: String,
    pub verified: bool,
    pub key_changed: bool,
    pub safety_number: Option<String>,
}

/// A single message exchanged with a peer.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MsgEnvelope {
    pub id: String,
    pub peer_id: String,
    pub direction: String,
    pub kind: String,
    pub text: Option<String>,
    pub image_base64: Option<String>,
    pub mime_type: Option<String>,
    pub file_name: Option<String>,
    pub timestamp: i64,
}

/// First transport message each side sends after the handshake completes.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Hello {
    pub display_name: String,
    pub listen_port: u16,
    pub public_key_b64: String,
}

/// Approval-gate control frame exchanged after `Hello`, before the message
/// loop. `decision` is one of `"pending"`, `"accepted"`, `"rejected"`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Control {
    pub decision: String,
}

/// Which side of a session this peer is — drives the approval handshake.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionRole {
    /// We dialed out; we wait for the remote to accept our chat request.
    Initiator,
    /// We received the connection; we prompt the user to accept/reject.
    Responder,
}

/// Ongoing encrypted application message.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireMessage {
    pub kind: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_base64: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_typing: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub signal: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub control: Option<String>,
}

/// Persisted trust entry (peers.json) used for TOFU + verified badge.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TrustEntry {
    pub verified: bool,
    pub display_name: String,
}

/// In-memory handle to an established encrypted session with one peer.
pub struct SessionHandle {
    pub peer: MsgPeer,
    pub tx: UnboundedSender<WireMessage>,
    pub reader: JoinHandle<()>,
}

/// Shared alias for the per-session transport state guarded for concurrent
/// read/write tasks. Only the CPU-bound encrypt/decrypt is performed while the
/// lock is held — never across a socket await.
pub type SharedTransport = std::sync::Arc<tokio::sync::Mutex<TransportState>>;
