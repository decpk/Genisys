//! Remote Terminal Access — an embedded HTTP + WebSocket server that lets a
//! device on the same LAN open a browser terminal (via a scanned QR code) and
//! drive a Genisys shell session with full input + output.
//!
//! Off by default; started/stopped on demand from the Terminal app's "Share"
//! control. Every connection is gated by a per-session access token (embedded
//! in the QR URL) **and** a one-time desktop approval prompt before any shell
//! is attached. Connections can mirror an existing desktop session or spawn a
//! dedicated, ephemeral shell that is torn down with the socket.

mod approve;
mod attach_new;
mod auth;
mod deny;
mod disconnect;
mod router;
mod server;
mod set_permissions;
mod set_tabs;
mod start;
mod state;
mod status;
mod stop;
mod types;
mod ws;

pub use approve::cmd_remote_terminal_approve;
pub use attach_new::cmd_remote_terminal_attach_new;
pub use deny::cmd_remote_terminal_deny;
pub use disconnect::cmd_remote_terminal_disconnect;
pub use set_permissions::cmd_remote_terminal_set_permissions;
pub use set_tabs::cmd_remote_terminal_set_tabs;
pub use start::cmd_remote_terminal_start;
pub use state::RemoteTerminalManager;
pub use status::cmd_remote_terminal_status;
pub use stop::cmd_remote_terminal_stop;
