//! Signal-style safety number derived from both peers' public keys.

use sha2::{Digest, Sha256};

/// `safety_number(a, b)` = SHA256 of the two raw public keys concatenated in
/// lexicographic order, rendered as decimal digits grouped into 5-digit chunks.
/// Sorting the inputs guarantees both peers compute the same value.
pub fn safety_number(a: &[u8], b: &[u8]) -> String {
    let (first, second) = if a <= b { (a, b) } else { (b, a) };
    let mut hasher = Sha256::new();
    hasher.update(first);
    hasher.update(second);
    let hash = hasher.finalize();
    let digits: String = hash.iter().map(|b| format!("{b:03}")).collect();
    digits
        .as_bytes()
        .chunks(5)
        .map(|c| std::str::from_utf8(c).unwrap_or(""))
        .collect::<Vec<_>>()
        .join(" ")
}
