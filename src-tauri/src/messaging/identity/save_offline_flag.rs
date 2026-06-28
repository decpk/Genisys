//! Persist the offline/invisible flag to presence.json.

use std::fs;

use crate::helpers::get_data_dir;

/// Writes `{ "offline": <bool> }` to `<data>/messaging/presence.json`. Kept in
/// a separate file from identity.json so display-name / rotate writes never
/// clobber the presence state and vice-versa.
pub fn save_offline_flag(offline: bool) -> Result<(), String> {
    let dir = get_data_dir().join("messaging");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("presence.json");
    let value = serde_json::json!({ "offline": offline });
    let pretty = serde_json::to_string_pretty(&value).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| e.to_string())
}
