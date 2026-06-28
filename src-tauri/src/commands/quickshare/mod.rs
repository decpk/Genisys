//! QuickShare — a LAN "drop hub". The desktop runs an embedded HTTP + WebSocket
//! server; any device that scans the QR code can upload files, download what
//! others shared, and exchange text snippets through a live tray. Every
//! connection is gated by a per-session access token embedded in the QR URL
//! (scanning the code is the grant — no per-device approval prompt). Received
//! files auto-save to the user's Downloads/QuickShare folder.
//!
//! Delivery is targeted: each item is addressed either to "everyone" or to one
//! device, and is only visible to / downloadable by the sender, the chosen
//! recipient, and the desktop host. Devices are identified by a stable
//! browser-generated id (persisted in localStorage) carried on the WS and on
//! every HTTP upload/download, so targeting survives reconnects.

mod add_files;
mod add_text;
mod auth;
mod download;
mod download_all;
mod download_all_zip;
mod events;
mod remove_all;
mod remove_item;
mod reveal_item;
mod router;
mod server;
mod start;
mod state;
mod status;
mod stop;
mod types;
mod upload;
mod util;
mod ws;
mod zip_and_send;
mod zip_bundle;

pub use add_files::cmd_quickshare_add_files;
pub use add_text::cmd_quickshare_add_text;
pub use download_all::cmd_quickshare_download_all;
pub use remove_all::cmd_quickshare_remove_all;
pub use remove_item::cmd_quickshare_remove_item;
pub use reveal_item::cmd_quickshare_reveal_item;
pub use start::cmd_quickshare_start;
pub use state::QuickShareManager;
pub use status::cmd_quickshare_status;
pub use stop::cmd_quickshare_stop;
pub use zip_and_send::cmd_quickshare_zip_and_send;
