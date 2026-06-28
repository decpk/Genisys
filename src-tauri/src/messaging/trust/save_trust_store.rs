//! Persist the trust store (peers.json).

use std::collections::HashMap;
use std::fs;

use crate::helpers::get_data_dir;
use crate::messaging::types::TrustEntry;

/// Atomically-ish writes the trust store as pretty JSON.
pub fn save_trust_store(store: &HashMap<String, TrustEntry>) -> Result<(), String> {
    let dir = get_data_dir().join("messaging");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("peers.json");
    let pretty = serde_json::to_string_pretty(store).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| e.to_string())
}
