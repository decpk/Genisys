//! Load the persisted offline/invisible flag from presence.json.

use std::fs;

use serde_json::Value;

use crate::helpers::get_data_dir;

/// Reads the `offline` boolean from `<data>/messaging/presence.json`. Defaults
/// to `false` (online/visible) when the file or key is missing or unreadable.
pub fn load_offline_flag() -> bool {
    let path = get_data_dir().join("messaging").join("presence.json");
    let Ok(data) = fs::read_to_string(&path) else {
        return false;
    };
    let Ok(value) = serde_json::from_str::<Value>(&data) else {
        return false;
    };
    value.get("offline").and_then(Value::as_bool).unwrap_or(false)
}
