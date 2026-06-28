//! Monitor — an embedded HTTP + WebSocket server that lets a device on the
//! same LAN open a browser viewer (via a scanned QR code) and watch + listen to
//! a live feed of the desktop's front camera and microphone.
//!
//! Off by default; started/stopped on demand from the Monitor app. Every
//! connection is gated by a per-session access token (embedded in the QR URL)
//! **and** a one-time desktop approval prompt before any media is sent. The
//! camera + mic are captured in the desktop webview and streamed peer-to-peer
//! over WebRTC; the server only brokers the WebRTC signaling (SDP + ICE) — it
//! never sees the media itself. The remote browser only views and re-frames
//! (pan/zoom) the feed and never captures anything.

mod approve;
mod auth;
mod deny;
mod disconnect;
mod router;
mod send_signal;
mod server;
mod start;
mod state;
mod status;
mod stop;
mod types;
mod ws;

pub use approve::cmd_monitor_approve;
pub use deny::cmd_monitor_deny;
pub use disconnect::cmd_monitor_disconnect;
pub use send_signal::cmd_monitor_send_signal;
pub use start::cmd_monitor_start;
pub use state::MonitorManager;
pub use status::cmd_monitor_status;
pub use stop::cmd_monitor_stop;
