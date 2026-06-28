//! Load (or generate on first run) the persistent static Noise keypair.

use std::fs;
use std::path::Path;

use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::Value;

use crate::helpers::get_data_dir;
use crate::messaging::types::NOISE_PATTERN;

/// Returns `(private_key, public_key, display_name)`.
///
/// The 32-byte raw private key is stored at `<data>/messaging/identity.key`
/// (unix perms 0o600). The public key (base64) and display name live in
/// `<data>/messaging/identity.json`. snow cannot re-derive a public key from a
/// private key, so the public key is persisted alongside the display name.
pub fn load_or_create_identity() -> Result<(Vec<u8>, Vec<u8>, String), String> {
    let dir = get_data_dir().join("messaging");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let key_path = dir.join("identity.key");
    let json_path = dir.join("identity.json");

    let existing_pub = read_json_str(&json_path, "publicKey").and_then(|s| STANDARD.decode(s).ok());

    let (private_key, public_key) = match (key_path.exists(), existing_pub) {
        (true, Some(pubk)) => {
            let priv_bytes = fs::read(&key_path).map_err(|e| e.to_string())?;
            if priv_bytes.len() != 32 || pubk.len() != 32 {
                generate_and_store(&key_path)?
            } else {
                (priv_bytes, pubk)
            }
        }
        _ => generate_and_store(&key_path)?,
    };

    let display_name = read_json_str(&json_path, "displayName")
        .filter(|s| !s.is_empty())
        .unwrap_or_else(default_display_name);

    write_identity_json(&json_path, &display_name, &STANDARD.encode(&public_key))?;
    Ok((private_key, public_key, display_name))
}

fn generate_and_store(key_path: &Path) -> Result<(Vec<u8>, Vec<u8>), String> {
    let params = NOISE_PATTERN.parse().map_err(|e| format!("noise params: {e:?}"))?;
    let kp = snow::Builder::new(params)
        .generate_keypair()
        .map_err(|e| e.to_string())?;
    fs::write(key_path, &kp.private).map_err(|e| e.to_string())?;
    set_key_perms(key_path);
    Ok((kp.private, kp.public))
}

fn read_json_str(path: &Path, key: &str) -> Option<String> {
    let data = fs::read_to_string(path).ok()?;
    let value: Value = serde_json::from_str(&data).ok()?;
    value.get(key)?.as_str().map(|s| s.to_string())
}

fn write_identity_json(path: &Path, display_name: &str, public_key_b64: &str) -> Result<(), String> {
    let value = serde_json::json!({ "displayName": display_name, "publicKey": public_key_b64 });
    let pretty = serde_json::to_string_pretty(&value).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| e.to_string())
}

fn default_display_name() -> String {
    std::env::var("USER")
        .ok()
        .or_else(|| std::env::var("USERNAME").ok())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "Genisys User".to_string())
}

#[cfg(unix)]
fn set_key_perms(path: &Path) {
    use std::os::unix::fs::PermissionsExt;
    let _ = fs::set_permissions(path, fs::Permissions::from_mode(0o600));
}

#[cfg(not(unix))]
fn set_key_perms(_path: &Path) {}
