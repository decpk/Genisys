//! Load the persisted trust store (peers.json).

use std::collections::HashMap;
use std::fs;

use crate::helpers::get_data_dir;
use crate::messaging::types::TrustEntry;

/// Returns a map of `<public_key_hex> -> TrustEntry`. Missing/corrupt file
/// yields an empty store rather than an error (first run is normal).
pub fn load_trust_store() -> HashMap<String, TrustEntry> {
    let path = get_data_dir().join("messaging").join("peers.json");
    fs::read_to_string(&path)
        .ok()
        .and_then(|data| serde_json::from_str(&data).ok())
        .unwrap_or_default()
}
