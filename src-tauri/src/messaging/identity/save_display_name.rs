//! Persist the display name (and current public key) to identity.json.

use std::fs;

use crate::helpers::get_data_dir;

/// Writes `{ "displayName", "publicKey" }`. The public key is re-written each
/// time so identity.json always carries enough to rebuild the identity.
pub fn save_display_name(display_name: &str, public_key_b64: &str) -> Result<(), String> {
    let dir = get_data_dir().join("messaging");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("identity.json");
    let value = serde_json::json!({ "displayName": display_name, "publicKey": public_key_b64 });
    let pretty = serde_json::to_string_pretty(&value).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| e.to_string())
}
