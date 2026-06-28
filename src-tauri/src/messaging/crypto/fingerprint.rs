//! Fingerprint derivation for a public key.

use sha2::{Digest, Sha256};

/// `fingerprint(pubkey)` = uppercase hex of SHA256(pubkey), grouped into
/// space-separated 4-character chunks.
pub fn fingerprint(pubkey: &[u8]) -> String {
    let hash = Sha256::digest(pubkey);
    let hex: String = hash.iter().map(|b| format!("{b:02X}")).collect();
    hex.as_bytes()
        .chunks(4)
        .map(|c| std::str::from_utf8(c).unwrap_or(""))
        .collect::<Vec<_>>()
        .join(" ")
}
