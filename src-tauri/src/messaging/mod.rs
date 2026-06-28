//! Messages app — P2P, end-to-end-encrypted, LAN-only local messaging.

pub mod crypto;
pub mod discovery;
pub mod identity;
pub mod manager;
pub mod network;
pub mod transport;
pub mod trust;
pub mod types;

pub use manager::MessagingManager;
pub use types::{MsgEnvelope, MsgIdentity, MsgPeer};
