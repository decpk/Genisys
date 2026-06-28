//! Token generation + constant-time comparison for Monitor access.

use uuid::Uuid;

/// Generate a 256-bit, URL-safe session token from two v4 UUIDs. UUID v4 is
/// backed by the OS CSPRNG (`getrandom`), giving ~256 bits of entropy rendered
/// as 64 lowercase hex characters — safe to embed in the QR URL.
pub fn generate_token() -> String {
    format!("{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple())
}

/// Constant-time equality so a network attacker cannot recover the token byte
/// by byte from response timing. Always compares the full length once the
/// lengths match, never short-circuiting on the first differing byte.
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
