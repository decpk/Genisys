//! Generate a brand-new static Noise keypair, overwriting the persisted one.
//!
//! Used by the "rotate identity" action so the device's fingerprint / unique
//! id changes. The 32-byte raw private key replaces `<data>/messaging/identity.key`
//! (unix perms 0o600). The caller is responsible for updating identity.json
//! (display name + new public key).

use std::fs;

use crate::helpers::get_data_dir;
use crate::messaging::types::NOISE_PATTERN;

/// Returns `(private_key, public_key)` for the freshly generated identity.
pub fn regenerate_identity() -> Result<(Vec<u8>, Vec<u8>), String> {
    let dir = get_data_dir().join("messaging");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let key_path = dir.join("identity.key");

    let params = NOISE_PATTERN.parse().map_err(|e| format!("noise params: {e:?}"))?;
    let kp = snow::Builder::new(params)
        .generate_keypair()
        .map_err(|e| e.to_string())?;
    fs::write(&key_path, &kp.private).map_err(|e| e.to_string())?;
    set_key_perms(&key_path);
    Ok((kp.private, kp.public))
}

#[cfg(unix)]
fn set_key_perms(path: &std::path::Path) {
    use std::os::unix::fs::PermissionsExt;
    let _ = fs::set_permissions(path, fs::Permissions::from_mode(0o600));
}

#[cfg(not(unix))]
fn set_key_perms(_path: &std::path::Path) {}
