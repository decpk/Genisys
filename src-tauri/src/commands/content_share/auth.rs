//! Token generation + constant-time comparison for Content Share transfers.
//! A one-time upload token is issued only after the receiver approves an offer,
//! so an unsolicited device cannot push a bundle without consent.

use uuid::Uuid;

/// Generate a 256-bit, URL-safe one-time token from two v4 UUIDs (OS CSPRNG),
/// rendered as 64 lowercase hex characters — safe to put in the upload URL.
pub fn generate_token() -> String {
    format!("{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple())
}

/// Constant-time equality so a network attacker cannot recover the token byte
/// by byte from response timing.
pub fn constant_time_eq(a: &str, b: &str) -> bool {
    let a = a.as_bytes();
    let b = b.as_bytes();
    if a.len() != b.len() {
        return false;
    }
    let mut diff: u8 = 0;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}
