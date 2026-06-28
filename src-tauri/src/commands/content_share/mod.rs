//! Content Share — share whole books and notes between Genisys devices on the same
//! LAN. The desktop runs a small embedded HTTP server and advertises itself via
//! mDNS (`_genisys-share._tcp.local.`); another Genisys device discovers it, sends a
//! book or a notes subtree, and — after the receiver approves — the content is
//! imported as a fresh copy (new ids) so it persists in the receiver's database.
//!
//! Transfer is two-step and approval-gated: `POST /share/offer` announces the
//! bundle and blocks on the user's accept/decline; on accept the sender uploads
//! the zip to `POST /share/upload` with a one-time token. Images travel inside
//! the bundle so the copy is fully self-contained.

mod auth;
mod bundle;
mod discovery;
mod identity;
mod import;
mod list_devices;
mod respond;
mod router;
mod send;
mod send_book;
mod send_notes;
mod server;
mod set_device_name;
mod start;
mod state;
mod status;
mod stop;
mod types;

pub use list_devices::cmd_content_share_list_devices;
pub use respond::cmd_content_share_respond;
pub use send_book::cmd_content_share_send_book;
pub use send_notes::cmd_content_share_send_notes;
pub use set_device_name::cmd_content_share_set_device_name;
pub use start::cmd_content_share_start;
pub use state::ContentShareManager;
pub use status::cmd_content_share_status;
pub use stop::cmd_content_share_stop;
