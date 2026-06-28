//! Persistent identity for this device on the Content Share LAN: a stable
//! device id (so peers can de-dupe and skip our own advertisement) and a
//! human-friendly display name shown in the other device's picker. Stored at
//! `<data_dir>/content-share/identity.json`. The name is user-renamable.

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::helpers::get_data_dir;

#[derive(Serialize, Deserialize)]
struct StoredIdentity {
    id: String,
    name: String,
}

fn identity_path() -> PathBuf {
    get_data_dir().join("content-share").join("identity.json")
}

/// Load the persisted `(device_id, device_name)`, creating and persisting a
/// fresh identity the first time.
pub fn load_or_create_identity() -> (String, String) {
    let path = identity_path();
    if let Ok(raw) = fs::read_to_string(&path) {
        if let Ok(stored) = serde_json::from_str::<StoredIdentity>(&raw) {
            if !stored.id.is_empty() {
                let name = if stored.name.trim().is_empty() {
                    default_device_name()
                } else {
                    stored.name
                };
                return (stored.id, name);
            }
        }
    }
    let id = Uuid::new_v4().simple().to_string();
    let name = default_device_name();
    save_identity(&id, &name);
    (id, name)
}

/// Persist a `(device_id, device_name)` pair (best-effort).
pub fn save_identity(id: &str, name: &str) {
    let path = identity_path();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let stored = StoredIdentity {
        id: id.to_string(),
        name: name.to_string(),
    };
    let _ = fs::write(&path, serde_json::to_string_pretty(&stored).unwrap_or_default());
}

/// A best-effort friendly default name derived from the environment. The user
/// can rename it later from the UI.
fn default_device_name() -> String {
    for key in ["HOSTNAME", "HOST", "COMPUTERNAME"] {
        if let Ok(v) = std::env::var(key) {
            let v = v.trim();
            if !v.is_empty() {
                return v.to_string();
            }
        }
    }
    if let Ok(user) = std::env::var("USER").or_else(|_| std::env::var("USERNAME")) {
        let user = user.trim();
        if !user.is_empty() {
            return format!("{user}'s Genisys");
        }
    }
    "Genisys Device".to_string()
}
