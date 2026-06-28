use sha2::{Digest, Sha256};

/// Stable filesystem-safe hex digest of `url`. Used as the basename of cached
/// image files so identical URLs across regenerations dedup automatically.
pub fn hash_url(url: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(url.as_bytes());
    let bytes = hasher.finalize();
    // Truncate to 20 hex chars (80 bits) — plenty for collision avoidance.
    let mut out = String::with_capacity(20);
    for b in bytes.iter().take(10) {
        out.push_str(&format!("{:02x}", b));
    }
    out
}
